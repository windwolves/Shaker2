var fs = require('fs');
var path = require('path');

var db = require('../models');

var handler = require('../common/handler');
var Rest = require('../common/rest');

var card = new Rest({
    model: db.Card,
    msgPrefix: 'CARD',
    list: false,
    get: {
        beforeCallbacks: [],
        include: [db.Post, db.Layout, db.Skin],
        beforeSend: function(model) {
        }
    },
    post: {
        beforeCallbacks: [
            handler.needLogin,
            handler.convertBodyField('layout', [db.Layout, 'code', 'id'], 'layoutId'),
            handler.convertBodyField('postId', [db.Post, 'id', 'entityId'], 'entityId')
        ],
        requireKeys: ['postId', 'layoutId'],
        uniqueKeys: [],
        createKeys: ['contents', 'postId', 'layoutId'],
        beforeCreate: function(model, req, res) {
            if(req.files && Array.isArray(req.files.photos)) {
                model.pictures = movePictures(req.body.entityId, req.body.pictures, req.files.photos);
            }
        },
        afterCreate: function(model, req, res) {
        }
    },
    put: {
        beforeCallbacks: [
            handler.needLogin,
            handler.checkOwner([db.Card, 'postId'], [db.Post, 'ownerId']),
            handler.convertBodyField('layout', [db.Layout, 'code', 'id'], 'layoutId')
        ],
        include: [db.Post],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['contents'],
        beforeUpdate: function(oldModel, newModel, req, res) {
            if(req.files && Array.isArray(req.files.photos)) {
                oldModel.pictures && removePictures(oldModel.pictures);
                newModel.pictures = movePictures(oldModel.Post.entityId, req.body.pictures, req.files.photos);
            }
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Card, 'postId'], [db.Post, 'ownerId'])]
    }
});

var router = card.getRouter();

card.init();

module.exports = router;

function setEntityId(req, res, next) {
    if(!req.body.postId) {
        res.warning('POST_ID_MISSING');
        return;
    }

    var _where = { id: req.body.postId };

    db.Post.find({ where: _where }).then(function(model) {
        if(model) {
            req.body[lowerKey + 'Id'] = model.id;
            next();
        }
        else {
            res.warning(upperKey + '_NOT_FOUND');
        }
    }, res.error);
}

function removePictures(pictures) {
    try {
        pictures = JSON.parse(pictures);

        if(Array.isArray(pictures)) {
            pictures.forEach(function(picture) {
                var absoluteFilePath = path.join(__dirname, '/../src' + picture);

                if(fs.existsSync(absoluteFilePath)) {
                    fs.unlinkSync(absoluteFilePath);
                }
            });
        }
    }
    catch(ex) {}
}

function movePictures(entityDirName, pictureIndexs, photos) {
    var relativeDir = '/upload/entity/' + entityDirName;
    var absoluteDir = path.join(__dirname, '/../src' + relativeDir);

    if(!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir);
    }

    var pictures = [];

    if(Array.isArray(pictureIndexs) && pictureIndexs.length > 0 && pictureIndexs.length == photos.length) {
        pictures = pictureIndexs.map(function(index) {
            var photo = photos[index];
            var pictureFileName = Date.now() + '-' + Math.round(Math.random() * 10000) + '-' + photo.name;

            fs.renameSync(photo.path, path.join(absoluteDir, pictureFileName));

            return relativeDir + '/' + pictureFileName;
        });
    }

    return JSON.stringify(pictures);
}
