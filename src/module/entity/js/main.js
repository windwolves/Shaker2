require.config({
    baseUrl: '/module/entity',
    paths: {
        'jquery': '/lib/zepto',
        'swiper': '/lib/idangerous.swiper',
        'text': '/lib/require-text',
        'css': '/lib/require-css',
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
    'swiper',
    'device'
], function($) {
    'use strict';

    var id = function() {
        var result = location.href.match(/entity\/([0-9a-zA-Z\-]+)/);

        if(!result || result.length < 1){
            return '';
        }

        return result[1];
    }();

    if(id == 'demo') {
        initEntity({
            'title': '偶尔不现实',
            'content': '反现实赐我一把匕首，剖开我所有不想剖开的现实',
            'picture': 'http://placekitten.com/288/288',
            'likeCount': 10,
            'postLimit': 25,
            'Theme': { 'code': 'theme_01' },
            'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
            'Posts': [{
                'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
                'likeCount': 2,
                'Cards': [
                    {
                        'Skin': { 'code': 'theme_01-skin_01' },
                        'Layout': { 'code': 'theme_01-layout_01' },
                        'pictures': ['http://placekitten.com/288/288'],
                        'contents': ['在空寂荒凉的高处，太阳灿烂的金丝，迎着白云奔跑，红色明媚的阳光，飞越百川峡谷和瀑布，诞生在它熟悉的空山绝谷。']
                    }
                ]
            }, {
                'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
                'likeCount': 5,
                'Cards': [
                    {
                        'Skin': { 'code': 'theme_01-skin_01' },
                        'Layout': { 'code': 'theme_01-layout_02' },
                        'pictures': ['http://placekitten.com/28375/603'],
                        'contents': ['在空寂荒凉的高处，太阳灿烂的金丝，迎着白云奔跑，红色明媚的阳光，飞越百川峡谷和瀑布，诞生在它熟悉的空山绝谷。光芒搅动甘泉，万物微笑，神灵雕琢大自然灵魂的画面：雄鹰翱翔的彩影，畅快的逃离无语的呼吸。腾飞的百鸟，抚摸春光，唱响大好河山，呼唤田野上空飘动的一切生命。窗外飞鹰粗厉的呜叫，凄切的啼呜，撕碎沉睡的世界，把消逝的美丽收回。春燕拾起疯狂的音符塞进荒原，召唤魂魄消磨春天的时光。大雁掠过冰霜，穿过阳光，消逝在风窝里。旋风带着沙粒卷起温暖，亲吻蜻蜓身上的色彩，飞鸟叼走几丝云雾，将太阳不朽的喃喃自语，留在沙滩上，送给阳光下的寂寞。风屏被鸟嘴啄通，填实记忆长河。巨鸟叼着玫瑰飞来，让清香做了一次腾空表演。阳光下杨柳，轻柔飘逸发丝，随风神指挥，填满零点的平静。河流水溅拍岸声，纹丝没有改变风向。']
                    }
                ]
            }]
        });
    }
    else {
        $.getJSON('/services/entity/' + id, function(result) {
            if(result.status == 'success') {
                initEntity(result.data);
            }
            else {
                console.error(result.data);
            }
        });
    }

    var $panel = $('.panel');
    var $entityPage = $('.page-entity');
    var $catalogPage = $('.page-catalog');
    var $postPageTemplate = $('.page-post').removeClass('hide').remove();

    var user;

    function initEntity(entity) {
        if(!entity) return;
        document.title = entity.title;

        if($('html').hasClass('wechat')) {
            require(['wechat'], function(wechat) {
                wechat.init(location.href.split('#')[0], {
                    imgUrl: (location.origin + entity.picture).replace(/.*http/g, 'http'),
                    title: entity.title,
                    description: entity.content
                });

                $('.js-footer-bar-join').on('click', function() {
                    if(user) {
                        alert(user.nickname + '亲，加入功能即将上线，敬请期待！');
                    }
                    else {
                        wechat.auth(function(authedUser) {
                            user = authedUser;
                            alert(user.nickname + '亲，加入功能即将上线，敬请期待！');
                        });
                    }
                });
            });
        }

        $(window).on('scroll', function(evt) {
            evt.preventDefault();
        }).on('touchmove', function(evt) {
            evt.preventDefault();
        }).on('mousemove', 'img', function(evt) {
            evt.preventDefault();
        });


        var deps = [];

        deps.push('text!/page/' + entity.Theme.code + '/index.html');
        deps.push('css!/page/' + entity.Theme.code + '/css/style.css');
        deps.push('/page/' + entity.Theme.code + '/js/index.js');

        require(deps, function(html, css, js) {
            var args = [].slice.call(arguments, 0);

            var theme = {
                html: html,
                js: js
            };

            initSwiper(entity, theme);
            initAds();
            initFooterBar(entity);
            initCatalog(entity);
        });
    }

    function initSwiper(entity, themeConfig) {
        var $swiperContainer = $entityPage.find('.swiper-container');
        var $swiperWrapper = $swiperContainer.find('.swiper-wrapper');

        var theme = entity.Theme.code;

        $panel.addClass(theme);

        // 首页
        var $topic = $entityPage.find('.topic').addClass(theme + '-cover');

        // 发起人信息
        $topic.find('.owner-profile').attr('src', entity.Owner.profile);
        $topic.find('.owner-nickname').text(entity.Owner.nickname);

        // 点赞数
        $topic.find('.entity-like_count span').text(entity.likeCount);

        // 参与人数
        $topic.find('.entity-joined span').text(entity.Posts.length);


        // 首页内容
        $topic.append(themeConfig.html);
        $topic.find('.wrapper:hidden').remove();

        $topic.find('.title').text(entity.title);
        $topic.find('.content').text(entity.content);
        $topic.find('.picture').addClass('lazy').attr('data-src', entity.picture);

        // 浏览回复的所有页面
        $topic.on('tap dblclick', function(evt) {
            $catalogPage.addClass('hide'); // 目录延时隐藏

            if(!entity.$page) {
                entity.$page = initPostPage(post, themeConfig);
            }

            entity.$page.fadeIn();
            $entityPage.fadeOut();
        });


        // 参与页模板
        var $postSlideTemplate = $entityPage.find('.post-slide').removeClass('hide').remove();

        // 参与页
        entity.Posts.forEach(function(post, index) {
            var $slide = $postSlideTemplate.clone().appendTo($swiperWrapper).find('.slide-inner');

            // 发起人信息
            $slide.find('.owner-index').text(index + 1 + '号');
            $slide.find('.owner-profile').attr('src', post.Owner.profile);
            $slide.find('.owner-nickname').text(post.Owner.nickname);

            // 点赞数
            $slide.find('.entity-post-like_count span').text(post.likeCount);

            // 页数
            $slide.find('.entity-post-cards span').text(post.Cards.length);

            // 显示回复的第一个页面
            setCard($slide, post.Cards[0], themeConfig);

            // 浏览回复的所有页面
            $slide.on('tap dblclick', function(evt) {
                $catalogPage.addClass('hide'); // 目录延时隐藏

                if(!post.$page) {
                    post.$page = initPostPage(post, themeConfig);
                }

                post.$page.fadeIn();
                $entityPage.fadeOut();
            });

        });


        var swiper = $swiperContainer.swiper({
            mode: 'horizontal',
            slideActiveClass: 'active',
            onTouchStart: function(swiper) {
                $swiperContainer.addClass('moving');
            },
            onTouchEnd: function(swiper) {
                if(swiper.previousIndex == swiper.activeIndex) {
                    $swiperContainer.removeClass('moving');
                }
            },
            onSlideChangeStart: function(swiper) {
                loadSwiperImages(swiper);

                if(swiper.activeIndex >= 5) {
                    $entityPage.find('.js-page-entity-back:hidden').fadeIn();
                }
                else {
                    $entityPage.find('.js-page-entity-back').fadeOut();
                }
            },
            onSlideChangeEnd: function(swiper) {
                $swiperContainer.removeClass('moving');
            }
        });

        $entityPage.find('.js-page-entity-back').on('click', function() {
            swiper.swipeTo(0);
        });

        loadSwiperImages(swiper);

    }

    function initPostPage(post, themeConfig) {
        var $page = $postPageTemplate.clone().appendTo($panel);

        var $container = $page.find('.swiper-container');
        var $wrapper = $page.find('.swiper-wrapper');

        $page.find('.js-post-footer-bar-back').on('click', function() {
            $page.fadeOut();
            $entityPage.fadeIn();
        });


        // 点赞数
        var $likeCount = $page.find('.post-like_count.js-post-like_count');
        var likeImgs = ['/module/entity/img/icon-like.png', '/module/entity/img/icon-like-active.png'];

        // 点赞/取消点赞
        var $likeCountImg = $likeCount.find('img');
        var $lkeCountSpan = $likeCount.find('span').text(post.likeCount);

        // @todo 判断是否已经点赞
        if(post.likeCount > 0) {
            $likeCount.addClass('active');
            $likeCountImg.attr('src', likeImgs[1]);
        }
        $likeCount.on('click', function() {
            // @todo 点赞或取消点赞
            if($likeCount.hasClass('active')) {
                post.likeCount--;
                $likeCountImg.attr('src', likeImgs[0]);
            }
            else {
                post.likeCount++;
                $likeCountImg.attr('src', likeImgs[1]);
            }
            $likeCount.toggleClass('active');
            $lkeCountSpan.text(post.likeCount);
        });

        post.Cards.forEach(function(card) {
            var $slide = $('<div class="swiper-slide"/>').appendTo($wrapper);
            setCard($slide, card, themeConfig);
        });

        var $cardIndex = $page.find('.post-card-index').text('1/' + post.Cards.length);

        var swiper = $container.swiper({
            mode: 'horizontal',
            slideActiveClass: 'active',
            onTouchStart: function(swiper) {
                $container.addClass('moving');
            },
            onTouchEnd: function(swiper) {
                if(swiper.previousIndex == swiper.activeIndex) {
                    $container.removeClass('moving');
                }
            },
            onSlideChangeStart: function(swiper) {
                loadSwiperImages(swiper);
                $cardIndex.text(swiper.activeIndex + 1 + '/' + swiper.slides.length);
            },
            onSlideChangeEnd: function(swiper) {
                $container.removeClass('moving');
            }
        });

        loadSwiperImages(swiper);

        return $page;

    }

    // 设置卡片信息
    function setCard($element, card, themeConfig) {
        var skin = card.Skin && card.Skin.code;
        var layout = card.Layout.code;

        $element.addClass(layout).addClass(skin);

        // 绑定模板
        $element.append(themeConfig.html);
        $element.find('.wrapper:hidden').remove();

        // 设置内容
        $element.find('.content').each(function(i) {
            if(card.contents && card.contents[i]) {
                $(this).text(card.contents[i]);
            }
        });

        // 设置图片
        $element.find('.picture').each(function(i) {
            if(card.pictures && card.pictures[i]) {
                $(this).addClass('lazy').attr('data-src', card.pictures[i]);
            }
        });

        if($.isFunction(themeConfig.js)) {
            themeConfig.js($element, card);
        }

    }

    function initAds() {
        // 广告
        var $ads = $panel.find('.ads');

        // 点击"关闭"按钮关闭广告
        $ads.find('.js-ads-close').on('click', function(event) {
            $ads.addClass('out');
        });

        var swiper = $entityPage.find('.swiper-container').data('swiper');
        if(swiper) {
            swiper.addCallback('SlideChangeStart', function(swiper) {
                $ads.addClass('out');
            });
        }

    }

    function initFooterBar(entity) {
        // 底部功能栏
        var $footerBar = $entityPage.find('.footer-bar');

        var swiper = $entityPage.find('.swiper-container').data('swiper');

        if(swiper) {
            $footerBar.find('.js-footer-bar-catalog').on('click', function() {
                $catalogPage.addClass('hide').fadeIn();
                $entityPage.fadeOut();
            });
        }

    }

    function initCatalog(entity) {
        // 参与人数
        $catalogPage.find('.js-post-count').html(entity.Posts.length);

        var $list = $catalogPage.find('.post-list');
        var $itemTemplate = $catalogPage.find('.post-item').removeClass('hide').remove();

        var $swiperContainer = $entityPage.find('.swiper-container');
        var swiper = $swiperContainer.data('swiper');

        entity.Posts.forEach(function(post, index) {
            // 在目录中添加一行回复信息
            var $item = $itemTemplate.clone();

            // 目录列表中点赞数
            $item.find('.post-like_count span').text(post.likeCount);

            // 目录列表中参与人
            $item.find('.post-owner img').attr('src', post.Owner.profile);
            $item.find('.post-owner span').text(post.Owner.nickname);

            var card = post.Cards[0];

            // 目录列表中内容
            if(card.contents && card.contents[0]) {
                $item.find('.post-content').text(card.contents[0]);
            }

            // 目录列表中图片
            if(card.pictures && card.pictures[0]) {
                $item.find('.post-picture').attr('src', card.pictures[0]);
            }

            if(swiper) {
                // 点击目录列表进行跳转
                $item.on('click', function(event) {
                    $catalogPage.fadeOut();
                    $entityPage.fadeIn();
                    swiper.swipeTo(index + 1);
                });
            }

            $list.append($item);
        });

        $list.wrap('<div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"></div></div></div>');
        $list.closest('.swiper-container').addClass('scroll-v').swiper({
            mode: 'vertical',
            scrollContainer: true
        });

    }

    function loadSwiperImages(swiper) {
        var preLoadLength = 1;
        var index = swiper.activeIndex;
        var start = index - preLoadLength > 0 ? index - preLoadLength : 0;
        var end = index + preLoadLength < swiper.slides.length ? index + preLoadLength : swiper.slides.length;

        $(swiper.slides.slice(start, end)).find('.lazy').removeClass('lazy').each(function() {
            var $this = $(this);
            var src = $(this).attr('data-src');

            if(this.tagName.toLowerCase() == 'img') {
                $this.attr('src', src);
            }
            else {
                $this.css('background', getBackground(src));
            }
        });

    }

    function getBackground(imageSrc) {
        return 'transparent url(' + imageSrc + ') 0 0 / 100% 100% no-repeat';
    }

    function setOwner($element, owner) {
        $element.find('img').attr('src', owner.profile);
        $element.find('span').text(owner.nickname);
    }

});
