var fs = require('fs');
var path = require('path');

var db = require('../models');

var utils = require('../common/utils');
var Rest = require('../common/rest');

var entity = new Rest({
    model: db.Entity,
    msgPrefix: 'ENTITY',
    list: false,
    get: {
        beforeCallbacks: [],
        include: [{ model: db.User, as: 'Owner' }, { model: db.Post, include: [db.Layout] }, { model: db.Theme }],
        order: 'Posts.createdAt asc',
        beforeSend: function(model) {
        }
    },
    post: {
        beforeCallbacks: [utils.needLogin],
        requireKeys: ['title', 'content', 'type', 'themeId'],
        uniqueKeys: [],
        createKeys: ['title', 'content', 'type', 'themeId'],
        beforeCreate: function(model, req, res) {
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
        }
    },
    put: {
        beforeCallbacks: [utils.needLogin],
        requireKeys: ['type'],
        uniqueKeys: [],
        updateKeys: ['content'],
        beforeUpdate: function(model, req, res) {
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: {
        beforeCallbacks: [utils.needLogin, checkOwner, deleteEntityPhotoDir]
    }
});

var router = entity.getRouter();

router.get('/demo', function(req, res) {
    db.User.find({ where: { username: 'admin' }}).then(function(user) {
        if(user) {
            var _where = { ownerId: user.id };
            var _order = 'createdAt desc';

            db.Entity.findAll({ where: _where, order: _order }).then(res.success, res.error);
        }
        else {
            res.warning('ADMIN_USER_NOT_FOUND');
        }
    }, res.error);
});

entity.init();

module.exports = router;


function deleteEntityPhotoDir(req, res, next) {
    var photoDir = '/img/photos/' + req.params.id;
    var dir = path.join(__dirname, '../app' + photoDir);

    deleteDir(dir);

    next();
}

function deleteDir(path) {
    var files = [];

    if(fs.existsSync(path)) {
        files = fs.readdirSync(path);

        files.forEach(function(file){
            var childPath = path + '/' + file;

            if(fs.statSync(childPath).isDirectory()) {
                deleteDir(childPath);
            }
            else {
                fs.unlinkSync(childPath);
            }
        });
        fs.rmdirSync(path);
    }
}


function checkOwner(req, res, next) {
    var id = req.params.id;

    db.Entity.find({ where: { id: id }}).then(function(entity) {
        if(entity) {
            if(entity.ownerId == req.session.user.id) {
                next();
            }
            else {
                res.warning('CANNT_DELETE_ENTITY');
            }
        }
        else {
            res.warning('ENTITY_NOT_FOUND');
        }
    }, res.error);
}
