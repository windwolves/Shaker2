var async = require('async');

var db = require('../models');
var config = require('../config');

if (!config.isRelease) {
    async.waterfall([
        syncDB,
        function(callback) {
            async.parallel([
                function(callback) {
                    var user = {
                        username: 'admin',
                        password: '21232f297a57a5a743894a0e4a801fc3',
                        nickname: 'Shaker',
                        profile: 'http://placekitten.com/288/288'
                    };

                    createUser(user, callback);
                },
                function(callback) {
                    var tags = [ { name: '反现实' }, { name: '超现实' } ];

                    async.map(tags, createTag, callback);
                },
                function(callback) {
                    var categorys = [ { name: '话题' } ];

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
            var tags = datas[1];
            var categorys = datas[2];
            var themes = datas[3];

            var entitys = [];
            var layouts = [];
            var skins = [];

            categorys.forEach(function(category) {
                entitys.push({
                    ownerId: user.id,
                    categoryId: category.id,
                    title: '反现实 Or 超现实',
                    content_text: '["反现实赐我一把匕首，剖开我所有不想剖开的现实"]',
                    content_pic: '["http://placekitten.com/288/288"]',
                    postLimit: 25
                });
            });

            themes.forEach(function(theme, index) {
                entitys[index] && (entitys[index].themeId = theme.id);

                layouts.push({ name: '板式1', code: theme.code + '-layout_01', themeId: theme.id });
                layouts.push({ name: '板式2', code: theme.code + '-layout_02', themeId: theme.id });

                skins.push({ name: '皮肤1', code: theme.code + '-skin_01', themeId: theme.id });
                skins.push({ name: '皮肤2', code: theme.code + '-skin_02', themeId: theme.id });
                skins.push({ name: '皮肤3', code: theme.code + '-skin_03', themeId: theme.id });
            });

            async.parallel([
                function(callback) {
                    callback(null, user);
                },
                function(callback) {
                    callback(null, tags);
                },
                function(callback) {
                    async.map(entitys, createEntity, callback);
                },
                function(callback) {
                    async.map(layouts, createLayout, callback);
                },
                function(callback) {
                    async.map(skins, createSkin, callback);
                }
            ], callback);
        },
        function(datas, callback) {
            var user = datas[0];
            var tags = datas[1];
            var entitys = datas[2];
            var layouts = datas[3];
            var skins = datas[4];

            var posts = [];

            entitys.forEach( function(entity) {
                layouts.filter(function(layout) {
                    return layout.themeId == entity.themeId;
                }).forEach(function(layout) {
                    skins.filter(function(layout) {
                        return layout.themeId == entity.themeId;
                    }).forEach(function(skin) {
                        posts.push({
                            entityId: entity.id,
                            layoutId: layout.id,
                            skinId: skin.id,
                            ownerId: user.id,
                            content_text: '["反现实赐我一把匕首，剖开我所有不想剖开的现实"]',
                            content_pic: '["http://placekitten.com/375/603"]'
                        });
                    });
                });
            });

            async.parallel([
                function(callback) {
                    async.map(entitys, function(entity, callback) {
                        entity.setTags(tags).then(function() {
                            callback(null);
                        }, callback);
                    }, callback);
                },
                function(callback) {
                    async.map(posts, createPost, callback);
                },
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

function createTag(tag, callback) {
    db.Tag.findOrCreate({ where: tag, defaults: tag }).spread(function(tag) {
        console.log('\nCreate Tag "' + tag.name + '" successful!\n');

        callback(null, tag);
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

function createSkin(skin, callback) {
    db.Skin.findOrCreate({ where: skin, defaults: skin }).spread(function(skin) {
        console.log('\nCreate Skin "' + skin.name + '" successful!\n');

        callback(null, skin);
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

function createPost(post, callback) {
    db.Post.findOrCreate({ where: post, defaults: post }).spread(function(post) {
        console.log('\nCreate Post "' + post.id + '" successful!\n');

        callback(null, post);
    }, callback);
}
