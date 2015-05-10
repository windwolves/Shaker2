$(function() {
    'use strict';

    var urlParams = location.pathname.split('/').slice(1);
    var entityId = urlParams[1];
    var postId = urlParams[3];

    $.getJSON('/services/entity/' + entityId, function(result) {
        if(result.status == 'success') {
            if(result.data.status != 'accept') {
                console.error('ENTITY_IS_PENDING');
                return;
            }

            initEntity(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    $.getJSON('/services/entity/hot', function(result) {
        if(result.status == 'success') {
            initHotList(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    function initEntity(entity) {
        var backUrl = location.origin + '/entity/' + entityId + '?pid=' + postId;

        var post = {};

        for(var i = 0, n = entity.Posts.length; i < n; i++) {
            if(entity.Posts.pid == postId) {
                post = entityId.Posts[i];
                break;
            }
        }

        var isAccept = post.status == 'accept';
        var card = post.Cards[0] || { pictures: [], contents: [] };

        // 微信分享
        window.wechat.share({
            link: backUrl,
            imgUrl: (isAccept ? card.pictures[0] : '') || entity.picture,
            title: entity.title,
            description: (isAccept ? card.contents[0] : '') || entity.content
        });

        $('.back').on('click', function() {
            location.href = backUrl;
        });
    }

    function initHotList(entitys) {
        $('.hot-list').html(template('hot-list-template', { entitys: entitys }));

        new Swiper('.swiper-container', {
            direction: 'horizontal',
            slidesPerView: 'auto',
            spaceBetween: 20,
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
