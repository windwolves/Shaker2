var db = require('../models');

var handler = require('../common/handler');
var Rest = require('../common/rest');

var suggestion = new Rest({
    model: db.Suggestion,
    msgPrefix: 'SUGGESTION',
    list: {
        beforeCallbacks: [],
        include: [{ model: db.User, as: 'Sender' }],
        order: 'createdAt desc'
    },
    get: {
        beforeCallbacks: [],
        include: [{ model: db.User, as: 'Sender' }],
        order: ''
    },
    post: {
        beforeCallbacks: [handler.needLogin],
        requireKeys: ['content'],
        uniqueKeys: [],
        createKeys: ['content'],
        beforeCreate: function(model, req, res) {
        },
        afterCreate: function(model, req, res) {
        }
    },
    put: false,
    delete: false
});

var router = suggestion.getRouter();

suggestion.init();

module.exports = router;
