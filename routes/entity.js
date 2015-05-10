var fs = require('fs');
var path = require('path');

var db = require('../models');

var handler = require('../common/handler');
var Rest = require('../common/rest');

var entity = new Rest({
    model: db.Entity,
    msgPrefix: 'ENTITY',
    list: false,
    get: {
        beforeCallbacks: [handler.setSessionUser],
        include: [
            { model: db.User, as: 'Owner' },
            { model: db.Post, include: [
                { model: db.User, as: 'Owner' },
                { model: db.Card, include: [db.Layout, db.Skin] }
            ] },
            db.Theme
        ],
        order: 'Posts.likeCount desc, Posts.createdAt asc, `Posts.Cards`.index asc',
        beforeSend: function(model, req, res) {
            var ownerId = req.session.user && req.session.user.id || 'none';

            if(model.status != 'accept' && model.ownerId != ownerId) {
                res.warning('ENTITY_NOT_AUDIT_PASS');
            }
            else {
                var posts = [];

                model.Posts.forEach(function(post) {
                    if(post.status == 'accept' || post.ownerId == ownerId) {
                        post.Cards.forEach(function(card) {
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

                        posts.push(post);
                    }
                });

                model.Posts = posts;
            }
        }
    },
    post: {
        beforeCallbacks: [
            handler.needLogin,
            handler.convertBodyField('theme', [db.Theme, 'code', 'id'], 'themeId'),
            handler.convertBodyField('layout', [db.Layout, 'code', 'id'], 'layoutId'),
            handler.convertBodyField('category', [db.Category, 'name', 'id'], 'categoryId')
        ],
        requireKeys: ['title'],
        uniqueKeys: [],
        createKeys: ['title', 'content', 'postLimit', 'themeId', 'categoryId'],
        beforeCreate: function(model, req, res) {
            model.type = 'realism';
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
            if(req.files && req.files.thumbnail && req.files.photo) {
                model.thumbnail = movePicture(model.id, req.files.thumbnail, true);
                model.picture = movePicture(model.id, req.files.photo);

                model.save();
            }

            db.Post.create({ entityId: model.id, ownerId: model.ownerId, isCover: true }).then(function(post) {
                db.Card.create({
                    postId: post.id,
                    layoutId: req.body.layoutId,
                    index: 0,
                    title: model.title,
                    contents: JSON.stringify([model.content]),
                    pictures: JSON.stringify([model.picture])
                });
            });

            setTimeout(function() {
                db.Entity.find({ where: { id: model.id, status: 'pending' } }).then(function(entity) {
                    if(entity) {
                        entity.updateAttributes({ status: 'accept' });

                        db.Post.find({ where: { entityId: entity.id, isCover: true, status: 'pending' } }).then(function(post) {
                            if(post) {
                                post.updateAttributes({ status: 'accept' });
                            }
                        });
                    }
                });
            }, 1000 * 60 * 30);
        }
    },
    put: false,
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Entity, 'ownerId'])]
    }
});

var router = entity.getRouter();

// router.get('/:id/like', function(req, res) {
//     var _where = {
//         id: req.params.id
//     };

//     db.Entity.find({ where: _where }).then(function(entity) {
//         if(entity) {
//             entity.increment({ likeCount: 1 }).then(res.success, res.error);
//         }
//         else {
//             res.warning('POST_NOT_FOUND');
//         }
//     }, res.error);
// });

// router.get('/:id/unlike', function(req, res) {
//     var _where = {
//         id: req.params.id
//     };

//     db.Entity.find({ where: _where }).then(function(entity) {
//         if(entity) {
//             entity.decrement({ likeCount: 1 }).then(res.success, res.error);
//         }
//         else {
//             res.warning('POST_NOT_FOUND');
//         }
//     }, res.error);
// });

router.get('/demo', function(req, res) {
    db.User.find({ where: { username: 'admin' } }).then(function(user) {
        if(user) {
            user.getEntities().then(res.success, res.error);
        }
        else {
            res.warning('NOT_ADMIN_USER');
        }
    }, res.error);
});

router.get('/hot', function(req, res) {
    db.Entity.findAll({
        where: { type: { $in: ['anti-realism', 'surrealism'] } },
        limit: 10
    }).then(res.success, res.error);
});

router.get('/type', function(req, res) {
    db.Entity.findAll({
        group: 'type',
        attributes: ['type']
    }).then(function(entitys) {
        var types = [];

        entitys.forEach(function(entity) {
            types.push(entity.type);
        });

        res.success(types);
    }, res.error);
});

router.get('/type/:type', function(req, res) {
    var where = { type: req.params.type };
    var offset = req.query.offset || 0;
    var limit = req.query.limit || 10;

    db.Entity.findAll({
        where: where,
        order: 'likeCount',
        include: [{ model: db.User, as: 'Owner' }],
        limit: limit,
        offset: offset
    }).then(res.success, res.error);
});


entity.init();

module.exports = router;

function removePicture(picture) {
    var absoluteFilePath = path.join(__dirname, '/../upload' + picture);

    if(fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
    }
}

function movePicture(entityDirName, photo, isThumb) {
    var relativeDir = '/entity/' + entityDirName;
    var absoluteDir = path.join(__dirname, '/../upload' + relativeDir);

    if(!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir);
    }

    var pictureFileName = ['thumbnail', Date.now(), Math.round(Math.random()) * 10000,'photo.jpg'].slice(isThumb ? 0 : 1).join('-');

    fs.renameSync(photo.path, path.join(absoluteDir, pictureFileName));

    return relativeDir + '/' + pictureFileName;
}
