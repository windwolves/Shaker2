var db = require('../models');

var Rest = require('../common/rest');

var theme = new Rest({
    model: db.Theme,
    msgPrefix: 'THEME',
    list: {
        beforeCallbacks: [],
        include: [db.Entity, db.Skin],
        order: 'Entities.createdAt asc',
    },
    get: {
        beforeCallbacks: [],
        include: [db.Entity, db.Skin],
        order: 'Entities.createdAt asc',
    },
    post: false,
    put: false,
    delete: false
});

var router = theme.getRouter();

theme.init();

module.exports = router;
