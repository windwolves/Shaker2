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
        beforeCallbacks: [],
        include: [
            { model: db.User, as: 'Owner' },
            { model: db.Post, include: [
                { model: db.User, as: 'Owner' },
                { model: db.Card, include: [db.Layout, db.Skin]}
            ] },
            db.Theme
        ],
        order: 'Posts.createdAt asc',
        beforeSend: function(model) {
            model.Posts.forEach(function(post) {
                post.Cards.forEach(function(card) {
                    try {
                        card.contents = JSON.parse(card.contents);
                        card.pictures = JSON.parse(card.pictures);
                    }
                    catch(ex) {
                        card.contents = [];
                        card.pictures = [];
                    }
                });
            });
        }
    },
    post: {
        beforeCallbacks: [
            handler.needLogin,
            handler.convertBodyField('theme', [db.Theme, 'code', 'id'], 'themeId'),
            handler.convertBodyField('category', [db.Category, 'name', 'id'], 'categoryId')
        ],
        requireKeys: ['title'],
        uniqueKeys: [],
        createKeys: ['title', 'content', 'themeId', 'categoryId'],
        beforeCreate: function(model, req, res) {
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
            if(req.files && req.files.photo) {
                model.updateAttributes({ picture: movePicture(model.id, req.files.photo) });
            }
        }
    },
    put: {
        beforeCallbacks: [
            handler.needLogin,
            handler.checkOwner([db.Entity, 'ownerId'])
        ],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['title', 'content'],
        beforeUpdate: function(oldModel, newModel, req, res) {
            if(req.files && req.files.photo) {
                oldModel.picture && removePicture(oldModel.picture);
                newModel.picture = movePicture(oldModel.id, req.files.photo);
            }
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Entity, 'ownerId'])]
    }
});

var router = entity.getRouter();

router.get('/recommend', function(req, res) {
    db.Entity.findAll({ order: 'recommend' }).then(function(entitys) {
        res.success(entitys);
    }, res.error);
});


entity.init();

module.exports = router;

function removePicture(picture) {
    var absoluteFilePath = path.join(__dirname, '/../upload' + picture);

    if(fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
    }
}

function movePicture(entityDirName, photo) {
    var relativeDir = '/entity/' + entityDirName;
    var absoluteDir = path.join(__dirname, '/../upload' + relativeDir);

    if(!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir);
    }

    var pictureFileName = Date.now() + '-' + Math.round(Math.random() * 10000) + '-' + photo.name;

    fs.renameSync(photo.path, path.join(absoluteDir, pictureFileName));

    return relativeDir + '/' + pictureFileName;
}
