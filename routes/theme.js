var db = require('../models');

var Rest = require('../common/rest');

var theme = new Rest({
    model: db.Theme,
    msgPrefix: 'THEME',
    list: {
        beforeCallbacks: [],
        include: [{ model: db.Entity }, { model: db.Skin }],
        order: 'Entities.createdAt asc',
    },
    get: false,
    post: false,
    put: false,
    delete: false
});

var router = theme.getRouter();

theme.init();

module.exports = router;
