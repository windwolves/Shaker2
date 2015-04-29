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

    $.getJSON('/services/post/' + url.segments[1], function(result) {
        if(result.status == 'success') {
            initPost(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    function initPost(post) {
        // 微信分享
        if(wechat) {
            wechat.init(location.href.split('#')[0], {
                imgUrl: (location.origin + post.Entity.picture).replace(/.*http/g, 'http'),
                title: post.Entity.title,
                description: post.Entity.content
            });
        }


        var $panel = $('.panel');


        var deps = [
            'text!/page/' + post.Entity.Theme.code + '/index.html',
            'css!/page/' + post.Entity.Theme.code + '/css/style.css'
        ];

        require(deps, function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo($('body'));

            $panel.append(template('post-template', post));

            var $cardIndex = $('.post-card-index');

            var swiper = new Swiper('.swiper-container', {
                spaceBetween: 10,
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingOnTransitionStart: true,
                onSlideChangeStart: function(swiper) {
                    $cardIndex.text(swiper.activeIndex + 1 + '/' + swiper.slides.length);
                }
            });

            // 返回
            $('.footer-bar-back').on('click', function() {
                if(url.params.from === 'catalog') {
                    history.go(-1);
                    return false;
                }
            });

            initLikeCount(post);

        });

    }

    function initLikeCount(post) {
        // 点赞数
        var $likeCount = $('.post-like_count');

        // 点赞/取消点赞
        var $likeCountImg = $likeCount.find('img');
        var $lkeCountSpan = $likeCount.find('span').text(post.likeCount);

        var likeImgs = ['/entity/post/img/icon-like.png', '/entity/post/img/icon-like-active.png'];

        var likedPosts = localStorage.getItem('LIKED_POSTS');

        likedPosts = likedPosts ? likedPosts.split(',') : [];

        if(likedPosts.indexOf(post.id) > -1) {
            $likeCount.addClass('active');
            $likeCountImg.attr('src', likeImgs[1]);
        }

        $likeCount.on('click', function() {
            var isLiked = $likeCount.hasClass('active');

            $.get('/services/post/' + post.id + '/' + (isLiked ? 'unlike' : 'like'), function(result) {
                if(result.status != 'success') {
                    console.error(result.data);
                    return;
                }

                if(isLiked) {
                    post.likeCount--;
                    likedPosts.splice(likedPosts.indexOf(post.id), 1);
                    $likeCountImg.attr('src', likeImgs[0]);
                }
                else {
                    post.likeCount++;
                    $likeCountImg.attr('src', likeImgs[1]);
                    likedPosts.push(post.id);
                }

                $likeCount.toggleClass('active');
                $lkeCountSpan.text(post.likeCount);

                localStorage.setItem('LIKED_POSTS', likedPosts.join(','));
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
