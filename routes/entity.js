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
                { model: db.Card, include: [db.Layout, db.Skin] }
            ] },
            db.Theme
        ],
        order: 'Posts.likeCount desc, Posts.createdAt asc, `Posts.Cards`.index asc',
        beforeSend: function(model) {
            model.Posts.forEach(function(post) {
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
            });
        }
    },
    post: {
        beforeCallbacks: [
            handler.needLogin,
            handler.convertBodyField('theme', [db.Theme, 'code', 'id'], 'themeId'),
            handler.convertBodyField('category', [db.Category, 'name', 'id'], 'categoryId')
        ],
        requireKeys: ['title', 'type'],
        uniqueKeys: [],
        createKeys: ['title', 'content', 'type', 'themeId', 'categoryId'],
        beforeCreate: function(model, req, res) {
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
            if(req.files && req.files.photo) {
                model.updateAttributes({
                    picture: movePicture(model.id, req.files.photo),
                    thumbnail: movePicture(model.id, req.files.thumbnail, true)
                });
            }
        }
    },
    put: false,
    delete: {
        beforeCallbacks: [handler.needLogin, handler.checkOwner([db.Entity, 'ownerId'])]
    }
});

var router = entity.getRouter();

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
    db.Entity.findAll({ include: [db.Theme] }).then(res.success, res.error);
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
