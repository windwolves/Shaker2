var db = require('../models');

var Rest = require('../common/rest');

var category = new Rest({
    model: db.Category,
    msgPrefix: 'CATEGORY',
    list: {
        beforeCallbacks: [],
        include: [{ model: db.Entity }],
        order: 'Entities.createdAt asc',
    },
    get: false,
    post: false,
    put: false,
    delete: false
});

var router = category.getRouter();

category.init();

module.exports = router;
