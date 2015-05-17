var fs = require('fs');
var path = require('path');

var db = require('../models');

var utils = require('../common/utils');
var handler = require('../common/handler');
var fileUtils = require('../common/fileUtils');
var Rest = require('../common/rest');

var post = new Rest({
    model: db.Post,
    msgPrefix: 'POST',
    list: false,
    get: {
        beforeCallbacks: [handler.setSessionUser],
        include: [
            { model: db.User, as: 'Owner' },
            { model: db.Entity, include: [db.Theme] },
            { model: db.Card, include: [db.Layout, db.Skin] }
        ],
        order: 'Cards.index asc',
        beforeSend: function(model, req, res) {
            var ownerId = req.session.user && req.session.user.id || 'none';

            if(model.status != 'accept' && model.ownerId != ownerId) {
                res.warning('POST_NOT_AUDIT_PASS');
            }
            else {
                model.Cards.forEach(function(card) {
                    try {
                        card.contents = JSON.parse(card.contents);
                        card.pictures = JSON.parse(card.pictures);
                    }
                    catch(ex) {}

                    if(!Array.isArray(card.contents)) {
                        card.contents = [];
                    }

                    if(!Array.isArray(card.pictures)) {
                        card.pictures = [];
                    }
                });
            }
        }
    },
    post: {
        beforeCallbacks: [handler.needLogin],
        requireKeys: ['entityId'],
        uniqueKeys: [],
        createKeys: ['entityId'],
        beforeCreate: function(model, req, res) {
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
            var absoluteDir = path.join(__dirname, '/../upload/entity/' + model.entityId);

            if(!fs.existsSync(absoluteDir)) {
                fs.mkdirSync(absoluteDir);
            }

            var cards = req.body.cards;

            if(!Array.isArray(cards)) return;

            cards.forEach(function(card, index) {
                card.postId = model.id;
                card.index = index;
                card.contents = JSON.stringify(card.contents);

                if(Array.isArray(card.pictures)) {
                    var cardPictruePrefix = 'entity/' + model.entityId + '/' + model.id + '-p' + index + '-';

                    card.pictures.forEach(function(picture, pi) {
                        card.pictures[pi] = fileUtils.create(picture, cardPictruePrefix);
                    });
                }

                card.pictures = JSON.stringify(card.pictures);
            });

            db.Card.bulkCreate(cards);

            model.Cards = cards;

            setTimeout(function() {
                db.Post.find({ where: { id: model.id, status: 'pending' } }).then(function(post) {
                    if(post) {
                        post.updateAttributes({ status: 'accept' });
                    }
                });
            }, 1000 * 60 * 30);
        }
    },
    put: {
        beforeCallbacks: [handler.checkPermission('post.update')],
        updateKeys: ['likeCount', 'status'],
        beforeUpdate: function(oldModel, newModel, req) {
        },
        afterUpdate: function(oldModel, newModel, req) {
            var sql = "UPDATE `Post` SET `operateLog`=concat(`operateLog`, '" + utils.getOperateLog(oldModel.toJSON(), req.session.user) + "'),`updatedAt`='" + utils.formatDate(new Date()) + "' WHERE `id` = '" + newModel.id + "'";
            db.sequelize.query(sql);
        }
    },
    delete: {
        beforeCallbacks: [handler.checkPermission('post.delete')]
    }
});

var router = post.getRouter();

router.get('/:id/like', function(req, res) {
    var _where = {
        id: req.params.id
    };

    db.Post.find({ where: _where }).then(function(post) {
        if(post) {
            post.increment({ likeCount: 1 }).then(res.success, res.error);
        }
        else {
            res.warning('POST_NOT_FOUND');
        }
    }, res.error);
});

router.get('/:id/unlike', function(req, res) {
    var _where = {
        id: req.params.id
    };

    db.Post.find({ where: _where }).then(function(post) {
        if(post) {
            post.decrement({ likeCount: 1 }).then(res.success, res.error);
        }
        else {
            res.warning('POST_NOT_FOUND');
        }
    }, res.error);
});

post.init();

module.exports = router;
