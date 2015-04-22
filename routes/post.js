var fs = require('fs');
var path = require('path');

var db = require('../models');

var handler = require('../common/handler');
var fileUtils = require('../common/fileUtils');
var Rest = require('../common/rest');

var post = new Rest({
    model: db.Post,
    msgPrefix: 'POST',
    list: false,
    get: {
        beforeCallbacks: [],
        include: [{ model: db.User, as: 'Owner' }, db.Entity, db.Card],
        beforeSend: function(model) {
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
                card.contents = JSON.stringify(card.contents);

                if(Array.isArray(card.pictures)) {
                    var cardPictruePrefix = 'entity/' + model.entityId + '/' + model.id + '-';

                    card.pictures.forEach(function(picture, index) {
                        card.pictures[index] = fileUtils.create(picture, cardPictruePrefix);
                    });
                }

                card.pictures = JSON.stringify(card.pictures);
            });

            db.Card.bulkCreate(cards);

            model.Cards = cards;
        }
    },
    put: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Post, 'ownerId'])],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: [],
        beforeUpdate: function(oldModel, newModel, req, res) {
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Post, 'ownerId'])]
    }
});

var router = post.getRouter();

post.init();

module.exports = router;
