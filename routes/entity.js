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
        include: [{ model: db.User, as: 'Owner' }, { model: db.Post, include: [db.Layout] }, { model: db.Theme }],
        order: 'Posts.createdAt asc',
        beforeSend: function(model) {
        }
    },
    post: {
        beforeCallbacks: [handler.needLogin, handler.setId('theme', 'code'), handler.setId('category', 'name')],
        requireKeys: ['title', 'themeId', 'categoryId'],
        uniqueKeys: [],
        createKeys: ['title', 'themeId', 'categoryId', 'type'],
        beforeCreate: function(model, req, res) {
            model.ownerId = req.session.user.id;
        },
        afterCreate: function(model, req, res) {
        }
    },
    put: {
        beforeCallbacks: [handler.needLogin, handler.checkSessionUser('entity', 'ownerId')],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['title', 'content'],
        beforeUpdate: function(model, req, res) {
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
