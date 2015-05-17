var async = require('async');

var db = require('../models');
var config = require('../config');

if (!config.isRelease) {
    async.waterfall([
        function syncDB(callback) {
            db.sequelize.sync({ force: true, logging: console.log }).done(function(err) {
                callback(err);
            });
        },
        function(callback) {
            async.parallel([
                function(callback) {
                    var user = {
                        username: 'admin',
                        password: '21232f297a57a5a743894a0e4a801fc3',
                        nickname: 'Shaker',
                        profile: 'http://placekitten.com/288/288',
                        type: 'admin'
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

            categorys.forEach(function(category, index) {
                entitys.push({
                    ownerId: user.id,
                    categoryId: category.id,
                    themeId: themes[index] ? themes[index].id : themes[0].id,
                    title: '反现实 Or 超现实',
                    content: '反现实赐我一把匕首，剖开我所有不想剖开的现实',
                    picture: 'http://placekitten.com/288/288',
                    thumbnail: 'http://placekitten.com/288/288',
                    type: 'anti-realism',
                    likeCount: 100,
                    postLimit: 25,
                    status: 'accept'
                });
            });

            themes.forEach(function(theme, index) {
                layouts.push({ name: '板式1', code: theme.code + '-layout_01', themeId: theme.id });
                layouts.push({ name: '板式2', code: theme.code + '-layout_02', themeId: theme.id });
                layouts.push({ name: '板式3', code: theme.code + '-layout_03', themeId: theme.id });
                layouts.push({ name: '板式4', code: theme.code + '-layout_04', themeId: theme.id });
                layouts.push({ name: '板式5', code: theme.code + '-layout_05', themeId: theme.id });
                layouts.push({ name: '板式6', code: theme.code + '-layout_06', themeId: theme.id });

                skins.push({ name: '皮肤1', code: theme.code + '-skin_01', themeId: theme.id });
            });

            async.parallel([
                function(callback) {
                    callback(null, user);
                },
                function(callback) {
                    async.waterfall([
                        function(callback) {
                            async.map(entitys, createEntity, callback);
                        },
                        function(entitys, callback) {
                            async.map(entitys, function(entity, callback) {
                                entity.setTags(tags).then(function() {
                                    callback(null, entity);
                                }, callback);
                            }, callback);
                        },
                    ], callback);
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
            var entitys = datas[1];
            var layouts = datas[2];
            var skins = datas[3];

            var posts = [];

            entitys.forEach(function(entity) {
                posts.push({ entityId: entity.id, ownerId: user.id, likeCount: 30, status: 'accept', isCover: true });
                posts.push({ entityId: entity.id, ownerId: user.id, likeCount: 20, status: 'accept' });
                posts.push({ entityId: entity.id, ownerId: user.id, likeCount: 10, status: 'accept' });
            });

            async.parallel([
                function(callback) {
                    callback(null, entitys);
                },
                function(callback) {
                    async.map(posts, createPost, callback);
                },
                function(callback) {
                    callback(null, layouts);
                },
                function(callback) {
                    callback(null, skins);
                },
            ], callback);
        },
        function(datas, callback) {
            var entitys = datas[0];
            var posts = datas[1];
            var layouts = datas[2];
            var skins = datas[3];

            var cards = [];

            entitys.forEach(function(entity) {
                posts.filter(function(post) {
                    return post.entityId == entity.id;
                }).forEach(function(post) {
                    layouts.filter(function(layout) {
                        return layout.themeId == entity.themeId;
                    }).forEach(function(layout, index) {
                        skins.filter(function(layout) {
                            return layout.themeId == entity.themeId;
                        }).forEach(function(skin) {
                            if(post.isCover) {
                                if(index) return;

                                cards.push({
                                    postId: post.id,
                                    layoutId: layout.id,
                                    skinId: skin.id,
                                    index: index,
                                    title: entity.title,
                                    contents: JSON.stringify([entity.content]),
                                    pictures: JSON.stringify([entity.picture])
                                })
                            }
                            else {
                                cards.push({
                                    postId: post.id,
                                    layoutId: layout.id,
                                    skinId: skin.id,
                                    index: index,
                                    contents: '["反现实赐我一把匕首，剖开我所有不想剖开的现实"]',
                                    pictures: '["http://placekitten.com/375/603"]'
                                });
                            }
                        });
                    });
                });
            });

            async.map(cards, createCard, callback);
        }
    ], function(err) {
        console.log(err || '\nInitialize database successful!\n');
        process.exit();
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

function createCard(card, callback) {
    db.Card.findOrCreate({ where: card, defaults: card }).spread(function(card) {
        console.log('\nCreate Card "' + card.id + '" successful!\n');

        callback(null, card);
    }, callback);
}
