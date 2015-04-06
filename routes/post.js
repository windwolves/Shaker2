var fs = require('fs');
var path = require('path');

var db = require('../models');

var handler = require('../common/handler');
var Rest = require('../common/rest');

var post = new Rest({
    model: db.Post,
    msgPrefix: 'POST',
    list: false,
    get: {
        beforeCallbacks: [],
        include: [{ model: db.User, as: 'Owner' }, { model: db.Entity }, { model: db.Layout }],
        beforeSend: function(model) {
            model.content_text = JSON.parse(model.content_text);
            model.content_pic = JSON.parse(model.content_pic);
        }
    },
    post: {
        beforeCallbacks: [handler.needLogin, handler.setId('layout', 'code')],
        requireKeys: ['title', 'entityId'],
        uniqueKeys: [],
        createKeys: ['title', 'entityId', 'layoutId', 'content_text', 'content_pic'],
        beforeCreate: function(model, req, res) {
            setContentPic(req);

            if(req.body.content_pic) {
                model.content_pic = JSON.stringify(req.body.content_pic);
            }

            model.content_text = JSON.stringify(req.body.content_text);
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
        }
    },
    put: {
        beforeCallbacks: [handler.needLogin, handler.checkSessionUser('post', 'ownerId')],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['title', 'content_text', 'content_pic'],
        beforeUpdate: function(oldModel, newModel, req, res) {
            req.body.entityId = oldModel.entityId;

            removeContentPic(oldModel, req);
            setContentPic(req);

            if(req.body.content_pic) {
                newModel.content_pic = JSON.stringify(req.body.content_pic);
            }

            newModel.content_text = JSON.stringify(req.body.content_text);
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkSessionUser('post', 'ownerId')]
    }
});

var router = post.getRouter();

post.init();

module.exports = router;


function removeContentPic(model, req) {
    var content_pic = req.body.content_pic;

    if(Array.isArray(content_pic) && content_pic.length > 0) {
        var content_pic_old = JSON.parse(model.content_pic);

        if(Array.isArray(content_pic_old)) {
            content_pic_old.forEach(function(picPath) {
                var filePath = path.join(__dirname, '/../src' + picPath);

                if(fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
    }

}

function setContentPic(req) {
    var entityId = req.body.entityId;
    var photoIndexs = req.body.content_pic;
    var photos = req.files.photos;

    var photoDir = '/upload/entity/' + entityId;
    var dir = path.join(__dirname, '/../src' + photoDir);

    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    if(Array.isArray(photoIndexs) && photoIndexs.length > 0 && Array.isArray(photos) && photos.length == photoIndexs.length) {
        var content_pic = [];

        photoIndexs.forEach(function(photoIndex, index) {
            var photo = photos[photoIndex];
            var name = getPhotoName(photo.name);

            fs.renameSync(photo.path, path.join(dir, name));

            content_pic.push(photoDir + '/' + name);
        });

        req.body.content_pic = content_pic;
    }
    else {
        req.body.content_pic = '';
    }
}

function getPhotoName(name) {
    return Date.now() + '-' + Math.round(Math.random() * 10000) + '-' + name;
}
