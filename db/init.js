var async = require('async');

var db = require('../models');
var config = require('../config');

if (!config.isProduction) {
    async.waterfall([
        syncDB,
        function(callback) {
            async.parallel([
                function(callback) {
                    var user = {
                        username: 'admin',
                        password: '21232f297a57a5a743894a0e4a801fc3',
                        nickname: 'Shaker'
                    };

                    createUser(user, callback);
                },
                function(callback) {
                    var categorys = [ { name: '反现实' }, { name: '超现实' } ];

                    async.map(categorys, createCategory, callback);
                },
                function(callback) {
                    var themes = [
                        { name: '主题1', code: 'theme_01' },
                        { name: '主题2', code: 'theme_02' },
                        { name: '主题3', code: 'theme_03' },
                        { name: '主题4', code: 'theme_04' },
                        { name: '主题5', code: 'theme_05' },
                        { name: '主题6', code: 'theme_06' },
                    ];

                    async.map(themes, createTheme, callback);
                }
            ], callback);
        },
        function(datas, callback) {
            var user = datas[0];
            var categorys = datas[1];
            var themes = datas[2];

            var entitys = [];
            var layouts = [];

            categorys.forEach(function(category) {
                entitys.push({ title: '反 Or 超', postLimit: 2, ownerId: user.id, categoryId: category.id });
            });

            themes.forEach(function(theme, index) {
                entitys[index] && (entitys[index].themeId = theme.id);

                layouts.push({ name: '板式1', code: theme.code + '-layout_01', themeId: theme.id });
                layouts.push({ name: '板式2', code: theme.code + '-layout_02', themeId: theme.id });
            });

            async.parallel([
                function(callback) {
                    async.each(entitys, createEntity, callback);
                },
                function(callback) {
                    async.each(layouts, createLayout, callback);
                }
            ], callback);
        }
    ], function(err) {
        console.log(err || '\nInitialize database successful!\n');
        process.exit();
    });
}

function syncDB(callback) {
    db.sequelize.sync({ force: true, logging: console.log }).done(function(err) {
        callback(err);
    });
}

function createUser(user, callback) {
    db.User.findOrCreate({ where: user, defaults: user }).spread(function(user) {
        console.log('\nCreate User "' + user.username + '" successful!\n');

        callback(null, user);
    }, callback);
}

function createTheme(theme, callback) {
    db.Theme.findOrCreate({ where: theme, defaults: theme }).spread(function(theme) {
        console.log('\nCreate Theme "' + theme.name + '" successful!\n');

        callback(null, theme);
    }, callback);
}

function createLayout(layout, callback) {
    db.Layout.findOrCreate({ where: layout, defaults: layout }).spread(function(layout) {
        console.log('\nCreate Layout "' + layout.name + '" successful!\n');

        callback(null, layout);
    }, callback);
}

function createCategory(category, callback) {
    db.Category.findOrCreate({ where: category, defaults: category }).spread(function(category) {
        console.log('\nCreate Category "' + category.name + '" successful!\n');

        callback(null, category);
    }, callback);
}

function createEntity(entity, callback) {
    db.Entity.findOrCreate({ where: entity, defaults: entity }).spread(function(entity) {
        console.log('\nCreate Entity "' + entity.title + '" successful!\n');

        callback(null, entity);
    }, callback);
}
