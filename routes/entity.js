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
        include: [{ model: db.User, as: 'Owner' }, { model: db.Post, include: [db.Layout, { model: db.User, as: 'Owner' }] }, db.Theme],
        order: 'Posts.createdAt asc',
        beforeSend: function(model) {
            model.content_text = JSON.parse(model.content_text);
            model.content_pic = JSON.parse(model.content_pic);

            model.Posts.forEach(function(post) {
                post.content_text = JSON.parse(post.content_text);
                post.content_pic = JSON.parse(post.content_pic);
            });
        }
    },
    post: {
        beforeCallbacks: [handler.needLogin, handler.setId('theme', 'code'), handler.setId('category', 'name')],
        requireKeys: ['title', 'themeId', 'categoryId'],
        uniqueKeys: [],
        createKeys: ['title', 'themeId', 'categoryId', 'content_text', 'type'],
        beforeCreate: function(model, req, res) {
            model.content_text = JSON.stringify(req.body.content_text);
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
            req.body.entityId = model.id;

            setContentPic(req);

            if(req.body.content_pic) {
                model.updateAttributes({ content_pic: JSON.stringify(req.body.content_pic) });
            }
        }
    },
    put: {
        beforeCallbacks: [handler.needLogin, handler.checkSessionUser('entity', 'ownerId')],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['title', 'content'],
        beforeUpdate: function(oldModel, newModel, req, res) {
            req.body.entityId = oldModel.id;

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
        beforeCallbacks: [handler.needLogin, handler.checkSessionUser('entity', 'ownerId')]
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
    var photos = req.files && req.files.photos;

    var photoDir = '/upload/entity/' + entityId;
    var dir = path.join(__dirname, '/../src' + photoDir);

    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    if(Array.isArray(photoIndexs) && photoIndexs.length > 0 && Array.isArray(photos) && photos.length == photoIndexs.length) {
        var content_pic = [];

        photoIndexs.forEach(function(photoIndex, index) {
            var photo = photos[photoIndex];
            var name = getRandom(photo.name);

            fs.renameSync(photo.path, path.join(dir, name));

            content_pic.push(photoDir + '/' + name);
        });

        req.body.content_pic = content_pic;
    }
    else {
        req.body.content_pic = '';
    }
}

function getRandom(key) {
    return Date.now() + '-' + Math.round(Math.random() * 10000) + '-' + key;
}
