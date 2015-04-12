var https = require('https');
var url = require('url');

var express = require('express');

var config = require('../config').wechat;
var utils = require('../common/utils');

var db = require('../models');

var temp = {};
var expires = 7000 * 1000;

var router = express.Router();

router.get('/auth/:code', function(req, res) {
    var code = req.params.code;

    loadUserAccessTokenByCode(code, function(result) {
        var refresh_token = result.refresh_token;
        var openid = result.openid;

        loadUserInfo(result.access_token, refresh_token, openid, function(result) {
            var userInfo = {
                username: openid,
                password: utils.md5('il0veshaker2'),
                nickname: result.nickname,
                profile: result.headimgurl,
                wechat: result.nickname,
                openid: openid,
                refresh_token: refresh_token
            };

            db.User.find({ where: { username: userInfo.username } }).then(function(user) {
                if(user) {
                    user.updateAttributes(userInfo).then(function(user) {
                        req.session.user = user;
                        res.success(user);
                    }, res.warning);
                }
                else {
                    db.User.create(userInfo).then(function(user) {
                        req.session.user = user;
                        res.success(user);
                    }, res.warning);
                }
            }, res.warning);

        });
    });

});

router.get('/user/:openid/:refresh_token', function(req, res) {
    var openid = req.params.openid;
    var refresh_token = req.params.refresh_token;

    loadUserAccessTokenByRefreshToken(refresh_token, function(result) {
        if(result.access_token) {
            db.User.find({ where: { openid: openid }}).then(function(user) {
                req.session.user = user;
                res.success(user);
            }, res.warning);
        }
        else {
            res.warning('INVALID_REFRESH_TOKEN');
        }
    });

});

router.get('/signature/:url', function(req, res) {
    var signatureUrl = req.params.url;

    if(url.parse(signatureUrl).host != config.host) {
        res.warning('UNKNOW_HOST');
        return;
    }

    if(!temp.access_token) {
        loadAccessToken(config.appid, config.secret, function(access_token) {
            temp.access_token = access_token;

            setTimeout(reloadAccessToken, expires);

            loadTicket(temp.access_token, successCallback);
        });
    }
    else if(!temp.ticket) {
        loadTicket(temp.access_token, successCallback);
    }
    else {
        successCallback();
    }

    function successCallback(ticket) {
        if(!ticket) {
            ticket = temp.ticket;
        }
        else {
            temp.ticket = ticket;
            setTimeout(reloadTicket, expires);
        }

        var noncestr = (Date.now() + '' + Math.round(Math.random() * 10000)).slice(-16);
        var timestamp = (Date.now() + '').slice(0, -3);
        var signature = utils.sha1([
            'jsapi_ticket=' + ticket,
            'noncestr=' + noncestr,
            'timestamp=' + timestamp,
            'url=' + signatureUrl
        ].join('&'));

        res.success({
            appId: config.appid,
            nonceStr: noncestr,
            timestamp: timestamp,
            signature: signature,
        });
    }

});

router.get('/cleartoken', function(req, res) {
    if(req.hostname == config.host) {

        log('Clear token');

        temp.access_token = null;
        temp.ticket = null;

        res.success(true);
    }
    else {
        res.warning('UNKNOW_HOST');
    }
});

module.exports = router;


function loadUserAccessTokenByCode(code, callback) {
    typeof callback !== 'function' && (callback = log);

    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    var params = {
        appid: config.appid,
        secret: config.secret,
        code: code,
        grant_type: 'authorization_code'
    };

    log('Load user access token params: ' + JSON.stringify(params));

    getJSON(url + '?' + toQueryString(params), function(result) {
        log('Load user access token result:' + JSON.stringify(result));

        if(result.access_token) {
            callback(result);
        }
    });
}

function loadUserAccessTokenByRefreshToken(refresh_token, callback) {
    typeof callback !== 'function' && (callback = log);

    var url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    var params = {
        appid: config.appid,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    };

    log('Refresh user access token params: ' + JSON.stringify(params));

    getJSON(url + '?' + toQueryString(params), function(result) {
        log('Refresh user access token result:' + JSON.stringify(result));

        callback(result);
    });
}

function loadUserInfo(access_token, refresh_token, openid, callback) {
    typeof callback !== 'function' && (callback = log);

    var url = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
        access_token: access_token,
        openid: openid,
        grant_type: 'zh_CN'
    };

    log('Load user information params: ' + JSON.stringify(params));

    getJSON(url + '?' + toQueryString(params), function(result) {
        log('Load user information result: ' + JSON.stringify(result));

        if(result.openid) {
            callback(result);
        }
    });
}

function reloadAccessToken() {
    loadAccessToken(config.appid, config.secret, function(access_token) {
        temp.access_token = access_token;

        setTimeout(reloadAccessToken, expires);
    });
}

function reloadTicket() {
    if(!temp.access_token) {
        loadWechatAccessToken(config.appid, config.secret, function(access_token) {
            temp.access_token = access_token;

            loadWechatTicket(temp.access_token, function(ticket) {
                temp.ticket = ticket;

                setTimeout(reloadTicket, expires);
            });
        });
    }
    else {
        loadWechatTicket(temp.access_token, function(ticket) {
            temp.ticket = ticket;

            setTimeout(reloadTicket, expires);
        });
    }
}

function loadAccessToken(appid, secret, callback) {
    typeof callback !== 'function' && (callback = log);

    var url = 'https://api.weixin.qq.com/cgi-bin/token';
    var params = {
        grant_type: 'client_credential',
        appId: appid,
        secret: secret
    };

    log('Load access token');

    getJSON(url + '?' + toQueryString(params), function(result) {
        log('Load access token result: ' + JSON.stringify(result));

        if(result.access_token) {
            callback(result.access_token);
        }
    });
}

function loadTicket(access_token, callback) {
    typeof callback !== 'function' && (callback = log);

    var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    var params = {
        type: 'jsapi',
        access_token: access_token
    };

    log('Load ticket');

    getJSON(url + '?' + toQueryString(params), function(result) {
        log('Load tiket result: ' + JSON.stringify(result));

        if(result.ticket) {
            callback(result.ticket);
        }
    });
}

function getJSON(url, callback) {
    typeof callback !== 'function' && (callback = log);

    log('Http request url: ' + url);

    https.get(url, function (res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                callback(data);
            }
            catch(ex) {
                log('Parse http response to json failed, msg: ' + ex);
            }
        });
    }).on('error', function(err) {
        log('Http request error, msg: ' + err);
    });
}

function toQueryString(params) {
    if(typeof params !== 'object') {
        return params;
    }

    var str = '';

    for(var key in params) {
        str += '&' + key + '=' + params[key];
    }

    return str.slice(1);
}

function log(msg) {
    console.log('Log(' + utils.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss') + '): ' + msg);
}
