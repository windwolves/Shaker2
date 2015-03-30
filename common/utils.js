var crypto = require('crypto');

var db = require('../models');

// format date, eg: formatDate(Date.now(), 'yyyy-MM-dd HH:mm')
exports.formatDate = function(date, format) {
    if(typeof date != 'object') {
        date = new Date(date);
    }
    format = format || 'yyyy-MM-dd HH:mm:ss';

    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
    };
    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1,  RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return format;
}

// md5 content
exports.md5 = function(content) {
    return crypto.createHash('md5').update(content).digest('hex');
};

// sha1
exports.sha1 = function(content) {
    return crypto.createHash('sha1').update(content).digest('hex');
};

// get client ip address
exports.getClientIP = function(request) {
    var ipAddress;
    var forwardedIpsStr = request.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = request.connection.remoteAddress;
    }
    return ipAddress;
};

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

exports.toObject = function(obj) {
    return typeof obj === 'object' && obj !== null ? obj : {};
};

exports.toFunction = function(func) {
    return typeof func === 'function' ? func : function() {};
};

exports.toArray = function(obj, allowType) {
    allowType = ['string', 'function'].indexOf(allowType) > -1 ? allowType : 'string';
    return Array.isArray(obj) ? obj : typeof obj === allowType ? [obj] : [];
};

exports.copyByKeys = function(keys, from, to) {
    to = to || {};

    keys.forEach(function(key) {
        to[key] = from[key];
    });

    return to;
};
