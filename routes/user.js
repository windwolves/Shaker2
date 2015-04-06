var fs = require('fs');

var db = require('../models');

var utils = require('../common/utils');
var handler = require('../common/handler');
var Rest = require('../common/rest');


var user = new Rest({
    model: db.User,
    msgPrefix: 'USER',
    list: false,
    get: false,
    post: {
        beforeCallbacks: [handler.needLogout],
        requireKeys: ['username', 'password', 'deviceToken'],
        uniqueKeys: ['username'],
        createKeys: ['username', 'password', 'deviceToken'],
        beforeCreate: function(model, req, res) {
            model.password = utils.md5(model.password);
        },
        afterCreate: function(model, req, res) {
            req.session.user = model;
        }
    },
    put: {
        beforeCallbacks: [handler.needLogin],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['nickname', 'phone', 'weibo', 'wechat', 'qq', 'deviceToken'],
        beforeUpdate: function(oldModel, newModel, req, res) {
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: false
});

var router = user.getRouter();

// router.post('/register',
//     handler.needLogout,
//     handler.requireKeys(['username', 'password', 'deviceToken']),
//     function(req, res) {
//         var _where = { username: req.body.username };

//         db.User.count({ where: _where }).then(function(count) {
//             if(count > 0) {
//                 res.warning('USER_ALREADY_EXISTS');
//             }
//             else {
//                 var _model = {
//                     username: req.body.username,
//                     password: req.body.password，
//                     deviceToken: req.body.deviceToken
//                 };

//                 db.User.create(_model).then(function(user) {
//                     req.session.user = user;
//                     res.success(user);
//                 }, res.error);
//             }
//         }, res.error);
//     }
// );

router.post('/login',
    handler.needLogout,
    handler.requireKeys(['username', 'password']),
    function(req, res) {
        var _where = {
            username: req.body.username,
            password: utils.md5(req.body.password)
        };

        db.User.find({ where: _where }).then(function(user) {
            if(user) {
                user.updateAttributes({ lastLoginTime: new Date() }).then(function(user) {
                    req.session.user = user;

                    res.success(user);
                }, res.error);
            }
            else {
                res.warning('USERNAME_OR_PASSWORD_WRONG');
            }
        }, res.error);
    }
);

router.get('/logout',
    handler.needLogin,
        function(req, res) {
        req.session.user = null;
        res.success('LOGOUT_SUCCESS');
    }
);

router.get('/check/username/:username',
    handler.needLogout,
    handler.requireKeys(['username'], 'params'),
    function(req, res) {
        var _where = {
            username: req.params.username
        };

        db.User.count({ where: _where }).then(res.success, res.error);
    }
);

router.post('/change/password',
    handler.needLogin,
    handler.requireKeys(['oldpassword', 'newpassword']),
    function(req, res) {
        var _where = {
            id: req.session.user.id
        };

        var oldpassword = utils.md5(req.body.oldpassword);
        var newpassword = utils.md5(req.body.newpassword);

        db.User.find({ where: _where }).then(function(user) {
            if(user) {
                if(user.password !== oldpassword) {
                    res.warning('OLD_PASSWORD_WRONG');
                }
                else {
                    user.updateAttributes({ password: newpassword }).then(res.success, res.error);
                }
            }
            else {
                res.warning('USER_NOT_EXIST');
            }
        }, res.error);
    }
);

router.post('/upload/profile',
    handler.needLogin,
    handler.requireKeys(['profile'], 'files'),
    function(req, res) {
        var _where = {
            id: req.session.user.id
        };

        var file = req.files.profile;

        db.User.find({ where: _where }).then(function(user) {
            if(user) {
                if(user.profile) {
                    try {
                        fs.unlinkSync('./profile/' + user.profile);
                    }
                    catch(ex) {
                        console.log('The old profile of User "' + user.username + '" not found');
                    }
                }
                var profile = user.username + '-' + file.name;
                fs.renameSync(file.path, __dirname + '/../src/upload/profile/' + profile);

                user.updateAttributes({ profile: profile }).then(res.success, res.error);
            }
            else {
                fs.unlinkSync(file.path);
                res.warning('USER_NOT_EXIST');
            }
        }, function(err) {
            fs.unlinkSync(file.path);
            res.error(err);
        });
    }
);

user.init();

module.exports = router;
