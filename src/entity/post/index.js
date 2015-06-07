$(function() {
    'use strict';

    var id = location.pathname.split('/').slice(1)[1];

    window.wechat.checkUser(true, function(userQueryString) {
        $.getJSON('/services/post/' + id + userQueryString, function(result) {
            if(result.status == 'success') {
                if(!result.data.isCover && result.data.Entity.status != 'accept') {
                    console.error('ENTITY_IS_PENDING');
                    return;
                }

                // result.data.Cards[0].Layout.code = 'theme_01-layout_01';
                // result.data.Cards[0].title = '反现实 Or 超现实反现实 Or 超现实反现实 Or 超现实反现实 Or 超现实反现实 Or 超现实反现实 Or 超现实反现实 Or 超现实';
                // result.data.Cards[0].contents = ['反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实反现实赐我一把匕首，剖开我所有不想剖开的现实'];
                initPost(result.data);
            }
            else {
                console.error(result.data);
            }
        });
    });

    function initPost(post) {
        var isAccept = post.status == 'accept';
        var card = post.Cards[0] || { pictures: [], contents: [] };

        // 微信分享
        window.wechat.share({
            link: !isAccept ? location.origin + '/entity/' + post.Entity.id : '',
            title: post.Entity.title,
            description: (isAccept ? card.contents[0] : '') || post.Entity.content
        });

        // pv+1
        var viewedPosts = localStorage.getItem('VIEWED_POSTS');
        viewedPosts = viewedPosts ? viewedPosts.split(',') : [];

        if(viewedPosts.indexOf(post.id) === -1) {
            $.get('/services/post/' + post.id + '/view', function(result) {
                if(result.status == 'success') {
                    viewedPosts.push(post.id);
                    localStorage.setItem('VIEWED_POSTS', viewedPosts.join(','));
                }
            });
        }

        $('<link rel="stylesheet"/>').attr('href', '/page/' + post.Entity.Theme.code + '/css/style.css').appendTo('head');

        $.get('/page/' + post.Entity.Theme.code + '/index.html', function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo($('body'));


            $('.panel').append(template('post-template', post));

            var $cardIndex = $('.post-card-index');

            var swiper = new Swiper('.swiper-container', {
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
                if(location.href.match(/\?.*from=catalog/)) {
                    history.back();
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
        else {
            $likeCountImg.attr('src', likeImgs[0]);
        }

        $likeCount.on('click', function() {
            var isLiked = $likeCount.hasClass('active');

            var url = '/services/post/' + post.id + '/' + (isLiked ? 'unlike' : 'like');

            $.get(url, function(result) {
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
