var https = require('https');
var express = require('express');

var config = require('../config');
var utils = require('../common/utils');

var router = express.Router();


router.post('/signature', function(req, res) {
    var params = req.body;

    if(!params.noncestr) {
        res.warning('NONCESTR_MISSING');
        return;
    }

    if(!params.timestamp) {
        res.warning('TIMESTAMP_MISSING');
        return;
    }

    if(!params.url) {
        res.warning('URL_MISSING');
        return;
    }

    var app = require('../index');

    if(!app.locals.access_token) {
        loadWechatAccessToken(config.wechat, function(access_token) {
            app.locals.access_token = access_token;

            setTimeout(reloadWechatAccessToken, 3600);

            loadWechatTicket(app.locals.access_token, _successCallback, _errorCallback);
        }, _errorCallback);
    }
    else if(!app.locals.ticket) {
        loadWechatTicket(app.locals.access_token, _successCallback, _errorCallback);
    }
    else {
        _successCallback();
    }

    function _successCallback(ticket) {
        if(!ticket) {
            ticket = app.locals.ticket;
        }
        else {
            app.locals.ticket = ticket;
            setTimeout(reloadWechatTicket, 3600);
        }

        var content = [
            'jsapi_ticket=' + ticket,
            'noncestr=' + params.noncestr,
            'timestamp=' + params.timestamp,
            'url=' + params.url
        ].join('&');

        res.success(utils.sha1(content));
    }

    function _errorCallback(err) {
        res.warning(err);
    }
});

router.get('/cleartoken', function(req, res) {
    if(req.hostname == config.wechat.host) {
        var app = require('../index');

        app.locals.access_token = null;
        app.locals.ticket = null;

        res.success(true);
    }
    else {
        res.warning('UNKNOW_HOST');
    }
});

module.exports = router;

function reloadWechatAccessToken() {
    var app = require('../index');

    loadWechatAccessToken(config.wechat, function(access_token) {
        app.locals.access_token = access_token;

        setTimeout(reloadWechatAccessToken, 3600);
    });
}

function reloadWechatTicket() {
    var app = require('../index');

    if(!app.locals.access_token) {
        loadWechatAccessToken(config.wechat, function(access_token) {
            app.locals.access_token = access_token;

            loadWechatTicket(app.locals.access_token, function(ticket) {
                app.locals.ticket = ticket;

                setTimeout(reloadWechatTicket, 3600);
            });
        });
    }
    else {
        loadWechatTicket(app.locals.access_token, function(ticket) {
            app.locals.ticket = ticket;

            setTimeout(reloadWechatTicket, 3600);
        });
    }
}

function loadWechatAccessToken(wechatConfig, successCallback, errorCallback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/token';
    var params = 'grant_type=client_credential&appid=' + wechatConfig.appid + '&secret=' + wechatConfig.secret;

    if(typeof errorCallback !== 'function') {
        errorCallback = function(err) { console.log(err); };
    }

    https.get(url + '?' + params, function(res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                if(data.access_token) {
                    successCallback(data.access_token);
                }
                else {
                    errorCallback(data || 'GET_ACCESS_TOKEN_FAILED');
                }
            }
            catch(ex) {
                errorCallback('PARSE_ACCESS_TOKEN_FAILED');
            }
        });
    }).on('error', function(err) {
        console.log(err);
    });
}

function loadWechatTicket(access_token, successCallback, errorCallback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    var params = 'type=jsapi&access_token=' + access_token;

    if(typeof errorCallback !== 'function') {
        errorCallback = function(err) { console.log(err); };
    }

    https.get(url + '?' + params, function (res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                if(data.ticket) {
                    successCallback(data.ticket);
                }
                else {
                    errorCallback(data || 'GET_TICKET_FAILED');
                }
            }
            catch(ex) {
                errorCallback('PARSE_TICKET_FAILED');
            }
        });
    }).on('error', function(err) {
        console.log(err);
    });
}
