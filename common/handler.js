var db = require('../models');


var getRes = exports.getRes = function(status, code, data) {
    var res = {};

    res.status = status || 'success';
    code && (res.code = code);
    data && (res.data = data);

    return res;
};

exports.needLogin = function(req, res, next) {
    if(req.session.user) {
        next();
    }
    else if(req.query && req.query._username && req.query._password) {
        var _where = {
            username: req.query._username,
            password: req.query._password
        };

        db.User.find({ where: _where }).then(function(user) {
            if(user) {
                user.updateAttributes({ lastLoginTime: new Date() }).then(function(user) {
                    req.session.user = user;

                    next();
                }, res.error);
            }
            else {
                res.warning('USERNAME_OR_PASSWORD_WRONG');
            }
        }, res.error);
    }
    else {
        res.warning('NOT_LOGIN');
    }
};

exports.needLogout = function(req, res, next) {
    if(!req.session.user) {
        next();
    }
    else {
        res.warning('NOT_LOGOUT');
    }
};

exports.setId = function(key, whereKey) {
    return function(req, res, next) {
        var lowerKey = key.toLowerCase();
        var upperKey = key.toUpperCase();
        var firstUpperKey = upperKey.slice(0, 1) + lowerKey.slice(1);

        if(!req.body[lowerKey]) {
            res.warning(upperKey + '_MISSING');
            return;
        }

        var _where = {};
        _where[whereKey] = req.body[lowerKey];

        db[firstUpperKey].find({ where: _where }).then(function(model) {
            if(model) {
                req.body[lowerKey + 'Id'] = model.id;
                next();
            }
            else {
                res.warning(upperKey + '_NOT_FOUND');
            }
        }, res.error);
    }
};

exports.checkSessionUser = function(key, whereKey) {
    return function(req, res, next) {
        var lowerKey = key.toLowerCase();
        var upperKey = key.toUpperCase();
        var firstUpperKey = upperKey.slice(0, 1) + lowerKey.slice(1);

        var id = req.params.id;

        db[firstUpperKey].find({ where: { id: id }}).then(function(model) {
            if(model) {
                if(model[whereKey] == req.session.user.id) {
                    next();
                }
                else {
                    res.warning('ERROR_OWNER');
                }
            }
            else {
                res.warning(upperKey + '_NOT_FOUND');
            }
        }, res.error);
    }
}

exports.requireKeys = function(keys, reqBodyKey) {
    !reqBodyKey && (reqBodyKey = 'body');

    return function(req, res, next) {
        for(var i = 0, n = keys.length; i < n; i++) {
            var key = keys[i];
            if(req[reqBodyKey][key] === undefined) {
                res.warning(key.toUpperCase() + '_MISSING');
                return;
            }
        }

        next();
    }
};
