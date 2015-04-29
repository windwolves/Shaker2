require.config({
    baseUrl: '/module/entity',
    paths: {
        'text': '/lib/require-text',
        'css': '/lib/require-css',
        'jquery': '/lib/zepto',
        'template': '/lib/template',
        'swiper': '/lib/swiper',
        'urlobject': '/js/urlobject',
        'wechat': '/js/wechat',
        'device': '/js/device',
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'wechat': ['jquery']
    },
    waitSeconds: 15
});


require([
    'jquery',
    'template',
    'urlobject',
    'wechat',
    'swiper',
    'device'
], function($, template, urlObject, wechat, Swiper) {
    'use strict';

    var url = urlObject();

    $.getJSON('/services/entity/' + url.segments[1], function(result) {
        if(result.status == 'success') {
            initEntity(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    function initEntity(entity) {

        // 微信分享
        if(wechat) {
            wechat.init(location.href.split('#')[0], {
                imgUrl: (location.origin + entity.picture).replace(/.*http/g, 'http'),
                title: entity.title,
                description: entity.content
            });
        }


        var $panel = $('.panel');

        // 广告
        var $ads = $panel.find('.ads');

        // 点击"关闭"按钮关闭广告
        $ads.find('.ads-close').on('click', function(event) {
            $ads.addClass('out');
        });

        // 提示信息
        var $tip = $panel.find('.tip');

        setTimeout(function() {
            $ads.addClass('out');
            $tip.addClass('out');
        }, 3000);


        var deps = [
            'text!/page/' + entity.Theme.code + '/index.html',
            'css!/page/' + entity.Theme.code + '/css/style.css'
        ];

        require(deps, function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo($('body'));

            $panel.append(template('entity-template', entity));

            var swiper = new Swiper('.swiper-container', {
                spaceBetween: 10,
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingOnTransitionStart: true,
                onClick: function(swiper, evt) {
                    if(swiper.activeIndex && entity.Posts[swiper.activeIndex - 1]) {
                        location.href = '/post/' + entity.Posts[swiper.activeIndex - 1].id;
                    }
                },
                onSlideChangeStart: function() {
                    $tip.addClass('out');
                }
            });

            // 点击底部logo返回封面页
            $panel.find('.footer-bar .logo').on('click', function() {
                swiper.slideTo(0);
            });

            if(url.params.pid) {
                entity.Posts.forEach(function(post, index) {
                    if(post.id == url.params.pid) {
                        swiper.slideTo(index + 1);
                    }
                });
            }

        });

    }

    // 禁用默认滑动效果
    $(window).on('scroll', function(evt) {
        evt.preventDefault();
    }).on('touchmove', function(evt) {
        evt.preventDefault();
    }).on('mousemove', 'img', function(evt) {
        evt.preventDefault();
    });

});
