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

exports.convertBodyField = function() {
    var args = [].slice.call(arguments, 0);

    var isRequired;
    var fromBodyKey;
    var list;
    var toBodyKey = args[args.length - 1];

    if(typeof args[0] === 'boolean') {
        isRequired = args[0];
        fromBodyKey = args[1];
        list = args.slice(2, -1);
    }
    else {
        isRequired = true;
        fromBodyKey = args[0];
        list = args.slice(1, -1);
    }

    return function(req, res, next) {
        if(!req.body[fromBodyKey]) {
            if(isRequired) {
                res.warning(fromBodyKey.toUpperCase() + '_MISSING');
            }
            else {
                next();
            }
            return;
        }

        var i = 0;
        var whereValue = req.body[fromBodyKey];

        loop(list[i]);

        function errorCallback(err) {
            res.warning(err || ('SET_' + toBodyKey.toUpperCase() + '_TO_BODY_FAILED'));
        }

        function successCallback(value) {
            req.body[toBodyKey] = value;

            next();
        }

        function loop(item) {
            if(!Array.isArray(item)) {
                successCallback(whereValue);
                return;
            }

            var dbModel = item[0];
            var modelSearchKey = item[1];
            var modelFieldKey = item[2];

            var where = {};
            where[modelSearchKey] = whereValue;

            dbModel.find({ where: where }).then(function(model) {
                if(model) {
                    whereValue = model[modelFieldKey];

                    loop(list[++i]);
                }
                else {
                    errorCallback('MODEL_NOT_GOUND');
                }
            }, errorCallback);
        }

    }
};


exports.checkOwner = function() {
    var list = [].slice.call(arguments, 0);

    return function(req, res, next) {
        var i = 0;
        var whereValue = req.params.id;

        loop(list[i]);

        function errorCallback(err) {
            res.warning(err || 'CHECK_OWNER_FAILED');
        }

        function successCallback(value) {
            if(value == req.session.user.id) {
                next();
            }
            else {
                res.warning('ERROR_OWNER');
            }
        }

        function loop(item) {
            if(!Array.isArray(item)) {
                successCallback(whereValue);
                return;
            }

            var dbModel = item[0];
            var modelFieldKey = item[1];

            dbModel.find({ where: { id: whereValue } }).then(function(model) {
                if(model) {
                    whereValue = model[modelFieldKey];

                    loop(list[++i]);
                }
                else {
                    errorCallback('MODEL_NOT_GOUND');
                }
            }, errorCallback);
        }

    }
};

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
