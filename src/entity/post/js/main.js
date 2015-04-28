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

    $.getJSON('/services/post/' + url.segments[1], function(result) {
        if(result.status == 'success') {
            var deps = [];

            deps.push('text!/page/' + result.data.Entity.Theme.code + '/index.html');
            deps.push('css!/page/' + result.data.Entity.Theme.code + '/css/style.css');

            require(deps, function(html) {
                initPost(result.data, html);
            });
        }
        else {
            console.error(result.data);
        }
    });

    var tapEventName = $('html').hasClass('desktop') ? 'dblclick' : 'tap';

    function initPost(post, themeTemplate) {
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
                imgUrl: (location.origin + post.Entity.picture).replace(/.*http/g, 'http'),
                title: post.Entity.title,
                description: post.Entity.content
            });
        }

        var $container = $('.swiper-container').addClass(post.Entity.Theme.code);
        var $wrapper = $container.find('.swiper-wrapper');

        // 返回
        $('.footer-bar-back').on('click', function() {
            history.go(-1);
            return false;
        });

        // 页面序号
        var $cardIndex = $('.post-card-index').text('1/' + post.Cards.length);

        // 页面设置
        post.Cards.forEach(function(card) {
            var skin = card.Skin && card.Skin.code;
            var layout = card.Layout.code;

            var $slide = $('<div class="swiper-slide"/>').appendTo($wrapper);

            $slide.addClass(layout).addClass(skin);

            // 绑定模板
            $slide.append(themeTemplate);
            $slide.find('.wrapper:hidden').remove();

            // 设置内容
            $slide.find('.content').each(function(i) {
                if(card.contents && card.contents[i]) {
                    $(this).text(card.contents[i]);
                }
            });

            // 设置图片
            $slide.find('.picture').each(function(i) {
                if(card.pictures && card.pictures[i]) {
                    $(this).addClass('lazy').attr('data-src', card.pictures[i]);
                }
            });
        });

        var swiper = $container.swiper({
            mode: 'horizontal',
            slideActiveClass: 'active',
            onSlideChangeStart: function(swiper) {
                loadSwiperImages(swiper);
                $cardIndex.text(swiper.activeIndex + 1 + '/' + swiper.slides.length);
            }
        });

        loadSwiperImages(swiper);

        // 点赞数
        var $likeCount = $('.post-like_count');

        // 点赞/取消点赞
        var $likeCountImg = $likeCount.find('img');
        var $lkeCountSpan = $likeCount.find('span').text(post.likeCount);

        var likeImgs = ['/module/entity/img/icon-like.png', '/module/entity/img/icon-like-active.png'];

        // @todo 判断是否已经点赞
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

    function loadSwiperImages(swiper) {
        var preLoadLength = 1;

        var index = swiper.activeIndex;
        var start = index - preLoadLength > 0 ? index - preLoadLength : 0;
        var end = index + preLoadLength < swiper.slides.length ? index + preLoadLength : swiper.slides.length;

        $(swiper.slides.slice(start, end)).find('.lazy').removeClass('lazy').each(function() {
            loadImage(this);
        });

    }

    function loadImage(element) {
        var $element = $(element);
        var src = $element.attr('data-src');

        if(element.tagName.toLowerCase() == 'img') {
            $element.attr('src', src);
        }
        else {
            $element.css('background', getBackground(src));
        }

    }

    function getBackground(imageSrc) {
        return 'transparent url(' + imageSrc + ') 50% 50% / cover no-repeat';
    }

});
