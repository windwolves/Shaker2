(function($) {
    var userAgent = navigator.userAgent;

    if (!userAgent || !userAgent.match(/micromessenger/i)) {
        return;
    }

    var serviceUrls = {
        auth: '/services/wechat/auth/:code',
        authRefresh: '/services/wechat/auth/refresh/:refresh_token',
        signature: '/services/wechat/signature/:url',
        cleartoken: '/services/wechat/cleartoken'
    };

    var Wechat = function(wx) {
        var ready = function(url, callback) {
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
        };

        var initShare = function(options) {
            options || (options = {});
            var link = options.link || location.href.split('#')[0];

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

        var auth = function(callback) {
            typeof callback !== 'function' && (callback = function() {});

            var result = location.href.match(/\?.*code=([^&]*)/);

            var code = result && result[1];

            if(code) {
                $.get(serviceUrls.auth.replace(':code', code), function(result) {
                    if(result.status == 'success') {
                        var user = result.data;

                        localStorage.setItem('refresh_token', user.refresh_token);
                        callback(user);
                    }
                });
            }
            else {
                var refresh_token = localStorage.getItem('refresh_token');

                if(refresh_token) {
                    $.get(serviceUrls.authRefresh.replace(':refresh_token', refresh_token), function(result) {
                        if(result.status == 'success') {
                            callback(result.data);
                        }
                        else {
                            localStorage.removeItem('refresh_token');
                            redirectToAuthPage();
                        }
                        // else if(result.status == 'warning' && result.data == 'INVALID_REFRESH_TOKEN') {
                        //     alert('用户信息已失效，需重新授权！');
                        //     localStorage.removeItem('refresh_token');

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
            init: init,
            auth: auth
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

    if(window.wx) return;

    if(typeof define === 'function') {
        define('wechat', ['http://res.wx.qq.com/open/js/jweixin-1.0.0.js'], Wechat);
    }
    else if($) {
        $.ajax({
            url: 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js',
            dataType: 'script',
            success: function() {
                window.wechat = Wechat(window.wx);
            }
        });
    }
    else {
        throw 'Please load jquery first';
    }

})(window.$);
