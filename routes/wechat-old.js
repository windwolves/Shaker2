var https = require('https');
var express = require('express');

var config = require('../config').wechat;
var utils = require('../common/utils');

var temp = {};
var expires = 7000 * 1000;

var router = express.Router();

router.post('/signature', function(req, res) {
    var params = req.body;

    if(!params.url) {
        res.warning('URL_MISSING');
        return;
    }
    else if(!isSafeUrl(params.url)) {
        res.warning('UNKNOW_HOST');
        return;
    }

    if(!temp.access_token) {
        loadAccessToken(config.appid, config.secret, function(access_token) {
            temp.access_token = access_token;

            setTimeout(reloadAccessToken, expires);

            loadTicket(temp.access_token, _successCallback, _errorCallback);
        }, _errorCallback);
    }
    else if(!temp.ticket) {
        loadTicket(temp.access_token, _successCallback, _errorCallback);
    }
    else {
        _successCallback();
    }

    function _successCallback(ticket) {
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
            'url=' + params.url
        ].join('&'));

        res.success({
            appId: config.appid,
            nonceStr: noncestr,
            timestamp: timestamp,
            signature: signature,
        });
    }

    function _errorCallback(err) {
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

function isSafeUrl(url) {
    if(!url || typeof url.search != 'function') {
        return false;
    }

    var index = url.search(config.host);
    return index > -1 && index < 10;
}

function reloadAccessToken() {
    loadAccessToken(config.appid, config.secret, function(access_token) {
        temp.access_token = access_token;

        setTimeout(reloadAccessToken, expires);
    });
}

function reloadTicket() {
    if(!temp.access_token) {
        loadAccessToken(config.appid, config.secret, function(access_token) {
            temp.access_token = access_token;

            loadTicket(temp.access_token, function(ticket) {
                temp.ticket = ticket;

                setTimeout(reloadTicket, expires);
            });
        });
    }
    else {
        loadTicket(temp.access_token, function(ticket) {
            temp.ticket = ticket;

            setTimeout(reloadTicket, expires);
        });
    }
}

function loadAccessToken(appid, secret, successCallback, errorCallback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/token';
    var params = 'grant_type=client_credential&appid=' + appid + '&secret=' + secret;

    typeof errorCallback !== 'function' && (errorCallback = log);

    log('Load access token');

    https.get(url + '?' + params, function(res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                if(data.access_token) {
                    log('Get access token successful!');

                    successCallback(data.access_token);
                }
                else {
                    errorCallback('Get access token failed, msg: ' + (data && data.errmsg));
                }
            }
            catch(ex) {
                errorCallback('Parse access token http response to json failed, msg: ' + ex);
            }
        });
    }).on('error', function(err) {
        errorCallback('Load access token http error, msg: ' + err);
    });
}

function loadTicket(access_token, successCallback, errorCallback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    var params = 'type=jsapi&access_token=' + access_token;

    typeof errorCallback !== 'function' && (errorCallback = log);

    log('Load ticket');

    https.get(url + '?' + params, function (res) {
        res.setEncoding('utf8');

        res.on('data', function(data) {
            try {
                data = JSON.parse(data);

                if(data.ticket) {
                    log('Get tiket successful!');

                    successCallback(data.ticket);
                }
                else {
                    errorCallback('Get tiket failed, msg: ' + (data && data.errmsg));
                }
            }
            catch(ex) {
                errorCallback('Parse ticket http response to json failed, msg: ' + ex);
            }
        });
    }).on('error', function(err) {
        errorCallback('Load ticket http request error, msg: ' + err);
    });
}

function log(msg) {
    console.log('Log(' + utils.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss') + '): ' + msg);
}
