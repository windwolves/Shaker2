var fs = require('fs');
var path = require('path');

var db = require('../models');

var handler = require('../common/handler');
var Rest = require('../common/rest');

var card = new Rest({
    model: db.Card,
    msgPrefix: 'CARD',
    list: false,
    get: false,
    post: false,
    put: false,
    delete: false
});

var router = card.getRouter();

card.init();

module.exports = router;
