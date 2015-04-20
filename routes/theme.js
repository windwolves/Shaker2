var db = require('../models');

var Rest = require('../common/rest');

var theme = new Rest({
    model: db.Theme,
    msgPrefix: 'THEME',
    list: {
        beforeCallbacks: [],
        include: [db.Layout],
        order: 'Layouts.code asc',
    },
    get: {
        beforeCallbacks: [],
        include: [db.Layout],
        order: 'Layouts.code asc',
    },
    post: false,
    put: false,
    delete: false
});

var router = theme.getRouter();

theme.init();

module.exports = router;
