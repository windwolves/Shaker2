(function($) {
    var userAgent = navigator.userAgent;

    var isInWechat = userAgent && userAgent.match(/micromessenger/i);

    var serviceUrls = {
        auth: '/services/wechat/auth/:code',
        authRefresh: '/services/wechat/auth/refresh/:refresh_token',
        signature: '/services/wechat/signature/:url',
        cleartoken: '/services/wechat/cleartoken'
    };

    var wechat = function() {
        var wx = window.wx;

        var ready = function(callback) {
            if(wx) {
                callback();
            }
            else {
                if(typeof define == 'function') {
                    require(['http://res.wx.qq.com/open/js/jweixin-1.0.0.js'], function(_wx) {
                        wx = _wx;
                        callback();
                    });
                }
                else if($) {
                    var script = document.createElement('script');
                    script.src = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js';

                    $(script).appendTo('head').on('load error', function(evt) {
                        wx = window.wx;
                        callback();
                    });
                }
                else {
                    throw 'Please load jquery first';
                }
            }

        };

        var signature = function(url, callback) {
            ready(function() {
                $.get(serviceUrls.signature.replace(':url', encodeURIComponent(url)), function(result) {
                    if(result.status == 'success') {
                        wx.config({
                            debug: !!(location.href.match(/\?.*debug=([^&]*)/)),
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
            });

        };

        var share = function(options) {
            signature(options.link, function() {
                wx.onMenuShareTimeline({
                    title: options.title,
                    link: options.link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });

                wx.onMenuShareAppMessage({
                    title: options.title,
                    desc: options.description,
                    link: options.link,
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
                    link: options.link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });

                wx.onMenuShareWeibo({
                    title: options.title,
                    link: options.link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });
            });

        };

        var auth = function(callback) {
            var urlParams = location.href.match(/\?.*code=([^&]*)/);

            var code = urlParams && urlParams[1];

            if(code) {
                $.get(serviceUrls.auth.replace(':code', code), function(result) {
                    if(result.status == 'success') {
                        var user = result.data;

                        localStorage.setItem('REFRESH_TOKEN', user.refresh_token);
                        callback(user);
                    }
                });

            }
            else {
                var refresh_token = localStorage.getItem('REFRESH_TOKEN');

                if(refresh_token) {
                    $.get(serviceUrls.authRefresh.replace(':refresh_token', refresh_token), function(result) {
                        if(result.status == 'success') {
                            callback(result.data);
                        }
                        else {
                            localStorage.removeItem('REFRESH_TOKEN');
                            redirectToAuthPage();
                        }
                        // else if(result.status == 'warning' && result.data == 'INVALID_REFRESH_TOKEN') {
                        //     alert('用户信息已失效，需重新授权！');
                        //     localStorage.removeItem('REFRESH_TOKEN');

                        //     redirectToAuthPage();
                        // }
                    });
                }
                else {
                    redirectToAuthPage();
                }

            }

        };

        return {
            share: function(options) {
                if(!isInWechat) return;

                !options && (options = {});
                !options.link && (options.link = location.href.split('#')[0]);
                !options.imgUrl && (options.imgUrl = '/entity/main/img/logo.png');
                !options.content && (options.content = '稀客--带你离开现实表面的互动内容社区');

                options.imgUrl = (location.origin + options.imgUrl).replace(/.*http/g, 'http');

                signature(options.link, function() {
                    share(options);
                });

            },
            auth: function(callback) {
                if(typeof callback !== 'function') {
                    throw 'callback must be function';
                }

                var urlParams = urlObject().params;

                if(urlParams._username && urlParams._password) {
                    callback({
                        username: urlParams._username,
                        password: urlParams._password
                    });
                }
                else if(isInWechat) {
                    ready(function() {
                        auth(callback);
                    });
                }

            },
            checkUser: function(isReturnQueryString, callback) {
                if(typeof isReturnQueryString == 'function') {
                    callback = isReturnQueryString;
                    isReturnQueryString = false;
                }

                if(typeof callback !== 'function') {
                    throw 'callback must be function';
                }

                var _callback = callback;

                callback = function(user) {
                    if(isReturnQueryString) {
                        _callback(user ? '?' + '_username=' + user.username + '&_password=' + user.password : '');
                    }
                    else {
                        _callback(user || {});
                    }
                };

                var urlParams = urlObject().params;

                if(urlParams._username && urlParams._password) {
                    callback({
                        username: urlParams._username,
                        password: urlParams._password
                    });
                }
                else if(isInWechat) {
                    ready(function() {
                        var refresh_token = localStorage.getItem('REFRESH_TOKEN');

                        if(refresh_token) {
                            $.get(serviceUrls.authRefresh.replace(':refresh_token', refresh_token), function(result) {
                                if(result.status == 'success') {
                                    callback(result.data);
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                        else {
                            callback();
                        }
                    });
                }
                else {
                    callback({
                        // username: 'admin',
                        // password: '21232f297a57a5a743894a0e4a801fc3'
                    });
                }

            }
        };
    };

    function redirectToAuthPage() {
        location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?' + toQueryString({
            appid: 'wxd6810c7d3b63d5c6',
            redirect_uri: encodeURIComponent(location.href),
            response_type: 'code',
            scope: 'snsapi_userinfo',
            state: 'STATE#wechat_redirect'
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

    function urlObject(url) {
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
    }

    window.wechat = wechat();

})(window.$);
