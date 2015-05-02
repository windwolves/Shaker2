$(function() {
    'use strict';

    var id = location.pathname.split('/').slice(1)[1];

    var result = location.href.match(/\?.*pid=([^&]*)/);

    var pid = result && result[1];

    $.getJSON('/services/entity/' + id, function(result) {
        if(result.status == 'success') {
            initEntity(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    function initEntity(entity) {
        // 微信分享
        if(typeof wechat !== 'undefined') {
            wechat.init({
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


        $('<link rel="stylesheet"/>').attr('href', '/page/' + entity.Theme.code + '/css/style.css').appendTo('head');

        $.get('/page/' + entity.Theme.code + '/index.html', function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo($('body'));

            $panel.append(template('entity-template', entity));

            var index = 0;

            if(pid) {
                entity.Posts.forEach(function(d, i) {
                    if(d.id == pid) {
                        index = i + 1;
                    }
                });
            }

            var swiper = new Swiper('.swiper-container', {
                spaceBetween: 10,
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingOnTransitionStart: true,
                initialSlide: parseInt(window.location.hash.slice(1)) || index,
                onClick: function(swiper, evt) {
                    if(swiper.activeIndex > 0) {
                        location.href = '/post/' + entity.Posts[swiper.activeIndex - 1].id;
                    }
                },
                onSlideChangeStart: function(swiper) {
                    $tip.addClass('out');
                }
            });

            // 点击底部logo返回封面页
            $panel.find('.footer-bar .logo').on('click', function() {
                swiper.slideTo(0);
            });

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