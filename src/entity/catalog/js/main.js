require.config({
    baseUrl: '/module/entity',
    paths: {
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

        $panel.append(template('catalog-template', entity));

        var swiper = new Swiper('.swiper-container', {
            scrollbar: '.swiper-scrollbar',
            direction: 'vertical',
            slidesPerView: 'auto',
            mousewheelControl: true,
            freeMode: true,
            preloadImages: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingOnTransitionStart: true,
            onTransitionEnd: function(swiper) {
                localStorage.setItem('CATALOG_WRAPPER_TRANSLATE', Date.now() + '|' + swiper.getWrapperTranslate());
            }
        });

        var translate = localStorage.getItem('CATALOG_WRAPPER_TRANSLATE');

        if(url.params.from === 'main' || !translate || (Date.now() - translate.split('|')[0] > 60000)) {
            localStorage.removeItem('CATALOG_WRAPPER_TRANSLATE');
        }
        else {
            swiper.setWrapperTransition(500);
            swiper.setWrapperTranslate(translate.split('|')[1]);
        }

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
