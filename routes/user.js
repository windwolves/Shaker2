var fs = require('fs');

var db = require('../models');

var utils = require('../common/utils');
var Rest = require('../common/rest');


var user = new Rest({
    model: db.User,
    msgPrefix: 'USER',
    list: false,
    get: false,
    post: {
        beforeCallbacks: [utils.needLogout],
        requireKeys: ['username', 'password'],
        uniqueKeys: ['username'],
        createKeys: ['username', 'password', 'profile', 'deviceToken'],
        beforeCreate: function(model, req, res) {
            model.password = utils.md5(model.password);
        },
        afterCreate: function(model, req, res) {
            req.session.user = user;
        }
    },
    put: {
        beforeCallbacks: [utils.needLogin],
        requireKeys: [],
        uniqueKeys: [],
        updateKeys: ['nickname', 'profile', 'telphone', 'weibo', 'wechat', 'qq', 'deviceToken'],
        beforeUpdate: function(model, req, res) {
        },
        afterUpdate: function(model, req, res) {
        }
    },
    delete: false
});

var router = user.getRouter();

router.post('/login', utils.needLogout, utils.requireKeys(['username', 'password']), function(req, res) {
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
});

router.get('/logout', utils.needLogin, function(req, res) {
    req.session.user = null;
    res.success('LOGOUT_SUCCESS');
});

router.get('/checkName/:username', utils.needLogout, utils.requireKeys(['username'], 'params'), function(req, res) {
    var _where = {
        username: req.params.username
    };

    db.User.count({ where: _where }).then(res.success, res.error);
});

router.get('/sync', utils.needLogin, function(req, res) {
    var _where = { id: req.session.user.id };

    db.User.find({ where: _where }).then(function(user) {
        if(user) {
            _where = { hostId: user.id };
            var _include = [{ model: db.Guest, where: { receiveTime: { gt: user.syncTime } } }];

            db.Activity.findAll({ where: _where, include: _include }).then(res.success, res.error);
        }
        else {
            res.warning('USER_NOT_EXIST');
        }
    }, res.error);
});

router.post('/changePassword', utils.needLogin, utils.requireKeys(['oldpassword', 'newpassword']), function(req, res) {
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
});

router.post('/upload', utils.needLogin, utils.requireKeys(['profile'], 'files'), function(req, res) {
    var _where = {
        id: req.session.user.id
    };

    var profileFile = req.files.profile;

    db.User.find({ where: _where }).then(function(user) {
        if(user) {
            if(user.profile) {
                try {
                    fs.unlinkSync('./app/' + user.profile);
                }
                catch(ex) {
                    console.log('The old profile of User "' + user.username + '" not found');
                }
            }
            var profile = './img/profiles/' + user.username + '-' + profileFile.name;
            fs.renameSync(profileFile.path, './app/' + profile);

            user.updateAttributes({ profile: profile }).then(res.success, res.error);
        }
        else {
            fs.unlinkSync(profileFile.path);
            res.warning('USER_NOT_EXIST');
        }
    }, function(err) {
        fs.unlinkSync(profileFile.path);
        res.error(err);
    });
});

user.init();

module.exports = router;
