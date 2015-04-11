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
