(function($) {
    var userAgent = navigator.userAgent;

    if (!userAgent || !userAgent.match(/micromessenger/i)) {
        return;
    }

    if (!$) {
        throw 'Please load jquery first';
    }

    var serviceUrls = {
        auth: '/services/wechat/auth/:code',
        user: '/services/wechat/user/:openid',
        signature: '/services/wechat/signature/:url',
        cleartoken: '/services/wechat/cleartoken'
    };

    var Wechat = function(wx) {
        var ready = function(url, callback) {
            $.get(serviceUrls.signature.replace(':url', encodeURIComponent(url)), function(result) {
                if(result.status == 'success') {
                    wx.config({
                        debug: !!location.search.slice(1).match(/debug=true/),
                        appId: result.data.appId,
                        nonceStr: result.data.nonceStr,
                        timestamp: result.data.timestamp,
                        signature: result.data.signature,
                        jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo']
                    });

                    wx.ready(callback);

                    wx.error(function(reason) {
                        if(reason == 'invalid signature') {
                            $.get(serviceUrls.cleartoken);
                        }
                    });

                }
                else {
                    console.error(result.data);
                }
            });
        };

        var initShare = function(options) {
            options || (options = {});

            wx.onMenuShareTimeline({
                title: options.title,
                link: link,
                imgUrl: options.imgUrl,
                fail: function(err) {
                    console.log(err);
                }
            });

            wx.onMenuShareAppMessage({
                title: options.title,
                desc: options.description,
                link: link,
                imgUrl: options.imgUrl,
                success: function(err) {
                    console.log(err);
                },
                fail: function(err) {
                    console.log(err);
                }
            });

            wx.onMenuShareQQ({
                title: options.title,
                desc: options.description,
                link: link,
                imgUrl: options.imgUrl,
                fail: function(err) {
                    console.log(err);
                }
            });

            wx.onMenuShareWeibo({
                title: options.title,
                link: link,
                imgUrl: options.imgUrl,
                fail: function(err) {
                    console.log(err);
                }
            });
        };

        var init = function(url, options) {
            ready(url, function() {
                initShare(options);
            });
        };

        return {
            init: init
        };
    };

    var parseURL = function(url) {
        var a = document.createElement('a');
        a.href = url || location.href;

        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function() {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length,
                    i = 0,
                    s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [undefined, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [undefined, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    };

    var toQueryString = function(params) {
        if(typeof params !== 'object') {
            return params;
        }

        var str = '';

        for(var key in params) {
            str += '&' + key + '=' + params[key];
        }

        return str.slice(1);
    };

    var url = parseURL();

    if(url.params.code) {
        $.get(serviceUrls.auth.replace(':code', url.params.code), function(result) {
            window.user = result;
        });
    }
    else if(localStorage.getItem('openid')) {
        var openid = localStorage.getItem('openid');

        $.get(serviceUrls.user.replace(':openid', openid), function(result) {
            localStorage.setItem('openid', result.username);
            window.user = result;
        });
    }
    else {
        location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?' + toQueryString({
            appid: 'wxd6810c7d3b63d5c6',
            redirect_uri: encodeURI(location.href),
            response_type: 'code',
            scope: 'snsapi_userinfo',
            state: 'wechat#wechat_redirect'
        });
    }

    if(typeof define === 'function') {
        define('wechat', ['http://res.wx.qq.com/open/js/jweixin-1.0.0.js'], Wechat);
    }
    else {
        $.getScript('http://res.wx.qq.com/open/js/jweixin-1.0.0', function() {
            window.wechat = new Wechat(window.wx);
        });
    }

})(window.$);
