var async = require('async');

var db = require('../models');
var config = require('../config');

if (!config.isProduction) {
    async.waterfall([
        syncDB,
        function(callback) {
            var user = {
                username: 'admin',
                password: '21232f297a57a5a743894a0e4a801fc3',
                nickname: 'Shaker'
            };

            createUser(user, callback);
        },
        function(user, callback) {
            var themes = [
                { name: '主题1', description: '主题1描述', code: 'theme-1' },
                { name: '主题2', description: '主题2描述', code: 'theme-2' },
                { name: '主题3', description: '主题3描述', code: 'theme-3' },
            ];

            async.eachSeries(themes, function(theme, callback) {
                var skins = [
                    { name: '皮肤1', description: '皮肤1描述', code: 'skin-1' },
                    { name: '皮肤2', description: '皮肤2描述', code: 'skin-2' },
                ];

                createTheme(theme, skins, callback);
            }, callback);
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

function createTheme(theme, skins, callback) {
    async.waterfall([
        function(callback) {
            db.Theme.findOrCreate({ where: theme, defaults: theme }).spread(function(theme) {
                console.log('\nCreate Theme "' + theme.name + '" successful!\n');

                callback(null, theme);
            }, callback);
        },
        function(theme, callback) {
            skins.forEach(function(skin) {
                skin.themeId = theme.id;
                skin.name = theme.name + skin.name;
            });

            async.eachSeries(skins, function(skin, callback) {
                createSkin(skin, callback);
            }, callback);
        }
    ], callback);
}

function createSkin(skin, callback) {
    db.Skin.findOrCreate({ where: skin, defaults: skin }).spread(function(skin) {
        console.log('\nCreate Skin "' + skin.name + '" successful!\n');

        callback(null, skin);
    }, callback);
}
