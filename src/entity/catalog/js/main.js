require.config({
    baseUrl: '/module/entity',
    paths: {
        'jquery': '/lib/zepto',
        'flow': '/lib/flow',
        'swiper': '/lib/idangerous.swiper',
        'text': '/lib/require-text',
        'css': '/lib/require-css',
        'urlobject': '/js/urlobject',
        'wechat': '/js/wechat',
        'device': '/js/device',
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'wechat': ['jquery'],
        'swiper': ['jquery']
    },
    waitSeconds: 15
});


require([
    'jquery',
    'urlobject',
    'wechat',
    'swiper',
    'device'
], function($, urlObject, wechat) {
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

    var tapEventName = $('html').hasClass('desktop') ? 'dblclick' : 'tap';

    function initEntity(entity) {
        // 禁用默认滑动效果
        $(window).on('scroll', function(evt) {
            evt.preventDefault();
        }).on('touchmove', function(evt) {
            evt.preventDefault();
        }).on('mousemove', 'img', function(evt) {
            evt.preventDefault();
        });

        // 微信分享
        if(wechat) {
            wechat.init(location.href.split('#')[0], {
                imgUrl: (location.origin + entity.picture).replace(/.*http/g, 'http'),
                title: entity.title,
                description: entity.content
            });
        }

        // 参与人数
        $('.post-count').html(entity.Posts.length);

        var $list = $('.post-list');
        var $itemTemplate = $list.find('.post-item').removeClass('hide').remove();

        entity.Posts.forEach(function(post, index) {
            var $item = $itemTemplate.clone().appendTo($list);

            // 点赞数
            $item.find('.post-like_count span').text(post.likeCount);

            // 参与人昵称
            $item.find('.post-owner span').text(post.Owner.nickname);

            var card = post.Cards[0];

            // 目录列表中内容
            if(card.contents && card.contents[0]) {
                $item.find('.post-content').text(card.contents[0]);
            }

            // 目录列表中图片
            if(card.pictures && card.pictures[0]) {
                $item.find('.post-picture').css('background-image', 'url(' + card.pictures[0] + ')');
            }

            // 点击目录列表进行跳转
            $item.on(tapEventName, function(event) {
                location.href = '/post/' + post.id;
            });
        });

        $list.wrap('<div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"></div></div></div>');
        $list.closest('.swiper-container').addClass('scroll-v').swiper({
            mode: 'vertical',
            scrollContainer: true
        });

    }

});
