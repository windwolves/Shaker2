$(function() {
    'use strict';

    var id = location.pathname.split('/').slice(1)[1];

    window.wechat.checkUser(true, function(userQueryString) {
        $.getJSON('/services/entity/' + id + userQueryString, function(result) {
            if(result.status == 'success') {
                initEntity(result.data);
            }
            else {
                console.error(result.data);
            }
        });
    });

    function initEntity(entity) {
        // 微信分享
        window.wechat.share({
            title: entity.title + (entity.status == 'pending' ? '(审核中)' : ''),
            description: entity.content
        });

        $('.panel').append(template('catalog-template', entity));

        var swiper = new Swiper('.swiper-container', {
            scrollbar: '.swiper-scrollbar',
            direction: 'vertical',
            slidesPerView: 'auto',
            mousewheelControl: true,
            freeMode: true,
            preloadImages: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingOnTransitionStart: true
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
