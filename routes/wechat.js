var https = require('https');
var url = require('url');

var express = require('express');

var config = require('../config').wechat;
var utils = require('../common/utils');

var temp = {};
var expires = 7000 * 1000;

var router = express.Router();

router.get('/auth/:code', function(req, res) {
    var code = req.params.code;

    loadUserAccessTokenByCode(code, function(result) {
        loadUserInfo(result.access_token, result.openid, function(user) {
            res.success(user);
        }, errorCallback);
    }, errorCallback);

    function errorCallback(err) {
        res.warning(err);
    }

});

router.get('/user/:openid', function(req, res) {
    var openid = req.params.openid;

    db.User.find({ where: { username: openid }}).then(function(user) {
        if(user) {
            loadUserAccessTokenByRefreshToken(user.refresh_token, function(result) {
                loadUserInfo(result.access_token, result.openid, function(user) {
                    res.success(user);
                }, errorCallback);
            }, errorCallback);
        }
        else {
            errorCallback('UNKNOW_OPENID');
        }
    }, errorCallback);

    function errorCallback(err) {
        res.warning(err);
    }

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

            loadTicket(temp.access_token, successCallback, errorCallback);
        }, errorCallback);
    }
    else if(!temp.ticket) {
        loadTicket(temp.access_token, successCallback, errorCallback);
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

    function errorCallback(err) {
        res.warning(err);
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


function loadUserAccessTokenByCode(code, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    var params = {
        appid: config.appid,
        secret: config.secret,
        code: code,
        grant_type: 'authorization_code'
    };

    log('Load user access token');

    getJSON(url + '?' + toQueryString(params), function(result) {
        if(result.errcode) {
            errorCallback(result);
        }
        else {
            successCallback(result);
        }
    }, errorCallback);
}

function loadUserAccessTokenByRefreshToken(refresh_token, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    var url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    var params = {
        appid: config.appid,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    };

    log('Refresh user access token');

    getJSON(url + '?' + toQueryString(params), function(result) {
        if(result.errcode) {
            errorCallback(result);
        }
        else {
            successCallback(result);
        }
    }, errorCallback);
}

function loadUserInfo(access_token, openid, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    var url = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
        access_token: access_token,
        openid: openid,
        grant_type: 'zh_CN'
    };

    log('Load user information');

    getJSON(url + '?' + toQueryString(params), function(result) {
        if(result.errcode) {
            errorCallback(result);
        }
        else {
            var newUserInfo = {
                username: result.openid,
                password: utils.md5('il0veshaker2'),
                nickname: result.nickname,
                profile: result.headimgurl,
                refresh_token: result.refresh_token
            };

            db.User.find({ where: { username: newUserInfo.username } }).then(function(user) {
                if(user) {
                    user.updateAttributes(newUserInfo).then(function(user) {
                        log('Update wechat user "' + user.nickname + '" successful!');

                        req.session.user = user;
                        successCallback(user);
                    }, errorCallback);
                }
                else {
                    db.User.create(newUserInfo).then(function(user) {
                        log('Create wechat user "' + user.nickname + '" successful!');

                        req.session.user = user;
                        successCallback(user);
                    }, errorCallback);
                }
            }, errorCallback);
        }
    }, errorCallback);
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

function loadAccessToken(appid, secret, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    var url = 'https://api.weixin.qq.com/cgi-bin/token';
    var params = {
        grant_type: 'client_credential',
        appId: appid,
        secret: secret
    };

    log('Load access token');

    getJSON(url + '?' + toQueryString(params), function(result) {
        if(result.access_token) {
            log('Get access token successful!');

            successCallback(result.access_token);
        }
        else {
            errorCallback('Get tiket failed, msg: ' + (result && result.errmsg));
        }
    });
}

function loadTicket(access_token, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    var params = {
        type: 'jsapi',
        access_token: access_token
    };

    log('Load ticket');

    getJSON(url + '?' + toQueryString(params), function(result) {
        if(result.ticket) {
            log('Get tiket successful!');

            successCallback(result.ticket);
        }
        else {
            errorCallback('Get tiket failed, msg: ' + (result && result.errmsg));
        }
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

function getJSON(url, successCallback, errorCallback) {
    typeof successCallback !== 'function' && (successCallback = log);
    typeof errorCallback !== 'function' && (errorCallback = log);

    https.get(url, function (res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                successCallback(data);
            }
            catch(ex) {
                errorCallback('Parse http response to json failed, msg: ' + ex);
            }
        });
    }).on('error', function(err) {
        errorCallback('Http request error, msg: ' + err);
    });
}

function log(msg) {
    console.log('Log(' + utils.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss') + '): ' + msg);
}
