require.config({
    baseUrl: '/module/entity',
    paths: {
        'jquery': '/lib/zepto',
        'swiper': '/lib/idangerous.swiper',
        'text': '/lib/require-text',
        'css': '/lib/require-css',
        'wechat': 'http://res.wx.qq.com/open/js/jweixin-1.0.0',
        'device': '/js/device',
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'swiper': ['jquery']
    },
    waitSeconds: 15
});


require([
    'jquery',
    'wechat',
    'swiper',
    'device'
], function($, wx) {
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
            'content_text': ['反现实赐我一把匕首，剖开我所有不想剖开的现实'],
            'content_pic': ['http://placekitten.com/288/288'],
            'likeCount': 10,
            'postLimit': 25,
            'Theme': { 'code': 'theme_01' },
            'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
            'Posts': [{
                'Skin': { 'code': 'theme_01-skin_01' },
                'Layout': { 'code': 'theme_01-layout_01' },
                'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
                'likeCount': 2,
                'content_pic': ['http://placekitten.com/288/288'],
                'content_text': ['在空寂荒凉的高处，太阳灿烂的金丝，迎着白云奔跑，红色明媚的阳光，飞越百川峡谷和瀑布，诞生在它熟悉的空山绝谷。'],
            }, {
                'Skin': { 'code': 'theme_01-skin_01' },
                'Layout': { 'code': 'theme_01-layout_02' },
                'Owner': { 'nickname': '昵称', 'profile': 'http://placekitten.com/288/288' },
                'likeCount': 5,
                'content_pic': ['http://placekitten.com/375/603'],
                'content_text': ['在空寂荒凉的高处，太阳灿烂的金丝，迎着白云奔跑，红色明媚的阳光，飞越百川峡谷和瀑布，诞生在它熟悉的空山绝谷。光芒搅动甘泉，万物微笑，神灵雕琢大自然灵魂的画面：雄鹰翱翔的彩影，畅快的逃离无语的呼吸。腾飞的百鸟，抚摸春光，唱响大好河山，呼唤田野上空飘动的一切生命。窗外飞鹰粗厉的呜叫，凄切的啼呜，撕碎沉睡的世界，把消逝的美丽收回。春燕拾起疯狂的音符塞进荒原，召唤魂魄消磨春天的时光。大雁掠过冰霜，穿过阳光，消逝在风窝里。旋风带着沙粒卷起温暖，亲吻蜻蜓身上的色彩，飞鸟叼走几丝云雾，将太阳不朽的喃喃自语，留在沙滩上，送给阳光下的寂寞。风屏被鸟嘴啄通，填实记忆长河。巨鸟叼着玫瑰飞来，让清香做了一次腾空表演。阳光下杨柳，轻柔飘逸发丝，随风神指挥，填满零点的平静。河流水溅拍岸声，纹丝没有改变风向。'],
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
    var $swiperContainer = $panel.find('.swiper-container');
    var $swiperWrapper = $panel.find('.swiper-wrapper');

    function initEntity(entity) {
        if(!entity) return;
        document.title = entity.title;

        initWechatConfig({}, function() {
            initWechatShare({
                imgUrl: location.origin,
                title: entity.title,
                description: entity.content_text && entity.content_text[0]
            });
        });

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
        });
    }

    function initWechatConfig(options, callback) {
        if(!$('html').hasClass('wechat')) return;

        options || (options = {});

        var appId = options.appId || 'wxd6810c7d3b63d5c6';
        var timestamp = (Date.now() + '').slice(0, -3);
        var nonceStr = Date.now() + '' + Math.round(Math.random() * 1000);
        var jsApiList = options.jsApiList ||  ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo'];

        var params = {
            noncestr: nonceStr,
            timestamp: timestamp,
            url: location.href.split('#')[0]
        };

        require(['wechat'], function(wx) {
            $.post('/services/wechat/signature', params, function(result) {
                if(result.status == 'success') {
                    wx.config({
                        debug: !!location.search.slice(1).match(/debug=true/),
                        appId: appId,
                        nonceStr: nonceStr,
                        timestamp: timestamp,
                        signature: result.data,
                        jsApiList: jsApiList
                    });

                    wx.error(function() {
                        $.get('/services/wechat/cleartoken');
                    });

                    callback();
                }
                else {
                    console.error(result.data);
                }
            });
        });
    }

    function initWechatShare(options) {
        if(typeof wx === 'undefined') return;

        options || (options = {});

        var link = options.link || location.href.split('#')[0];

        wx.onMenuShareTimeline({
            title: options.title,
            link: link,
            imgUrl: options.imgUrl,
            fail: function(err) {
                console.log(err);
            }
        });

        wx.onMenuShareAppMessage({
            title: options.title,
            desc: options.description,
            link: link,
            imgUrl: options.imgUrl,
            success: function(err) {
                console.log(err);
            },
            fail: function(err) {
                console.log(err);
            }
        });

        wx.onMenuShareQQ({
            title: options.title,
            desc: options.description,
            link: link,
            imgUrl: options.imgUrl,
            fail: function(err) {
                console.log(err);
            }
        });

        wx.onMenuShareWeibo({
            title: options.title,
            link: link,
            imgUrl: options.imgUrl,
            fail: function(err) {
                console.log(err);
            }
        });
    }

    function initSwiper(entity, themeConfig) {
        var theme = entity.Theme.code;

        $panel.addClass(theme);

        // 首页
        var $topic = $panel.find('.topic').addClass(theme + '-cover').appendTo($swiperWrapper);

        // 点赞数
        var likeImgs = ['/module/entity/img/icon-like.png', '/module/entity/img/icon-like-active.png'];
        var $likeCount = $topic.find('.js-like_count');
        var $likeCountImg = $likeCount.find('img');
        var $likeCountSpan = $likeCount.find('span').text(entity.likeCount);

        // @todo 判断是否已经点赞
        if(entity.likeCount > 0) {
            $likeCount.addClass('active');
            $likeCountImg.attr('src', likeImgs[1]);
        }
        $likeCount.on('click', function() {
            event.stopPropagation();

            // @todo 点赞或取消点赞
            if($likeCount.hasClass('active')) {
                entity.likeCount--;
                $likeCountImg.attr('src', likeImgs[0]);
            }
            else {
                entity.likeCount++;
                $likeCountImg.attr('src', likeImgs[1]);
            }
            $likeCount.toggleClass('active');
            $likeCountSpan.text(entity.likeCount);
        });

        // 首页内容
        $topic.append($(themeConfig.html));
        $topic.find('.wrapper:hidden').remove();

        $topic.find('.title').text(entity.title);

        $topic.find('.content_pic').each(function(i) {
            if(entity.content_pic && entity.content_pic[i]) {
                $(this).addClass('lazy').attr('data-src', entity.content_pic[i]);
            }
        });

        $topic.find('.content_text').each(function(i) {
            if(entity.content_text && entity.content_text[i]) {
                $(this).text(entity.content_text[i]);
            }
        });


        // 目录
        var $catalog = $panel.find('.catalog').appendTo($swiperWrapper);

        $catalog.find('.js-post-count').html(entity.Posts.length);

        var $list = $catalog.find('.post-list');
        var $itemTemplate = $catalog.find('.post-item').removeClass('hide').remove();

        // 参与页
        entity.Posts.forEach(function(post, index) {
            var skin = post.Skin && post.Skin.code;
            var layout = post.Layout.code;

            // 在目录中添加一行回复信息
            var $item = $itemTemplate.clone();

            $item.find('.post-content_pic').attr('src', post.content_pic[0]);
            $item.find('.post-content_text').text(post.content_text[0]);
            $item.find('.post-like_count span').text(post.likeCount);
            setOwner($item.find('.post-owner'), post.Owner);

            $item.on('click', function(event) {
                if(!$swiperContainer.hasClass('moving')) {
                    swiper.swipeTo(index + 2);
                }
            });

            $list.append($item);

            // 参与信息
            var $slide = $('<div class="swiper-slide"/>').addClass(layout).addClass(skin).appendTo($swiperWrapper);

            $slide.html(themeConfig.html);
            $slide.find('.wrapper:hidden').remove();

            $slide.find('.content_pic').each(function(i) {
                if(post.content_pic && post.content_pic[i]) {
                    $(this).addClass('lazy').attr('data-src', post.content_pic[i]);
                }
            });

            $slide.find('.content_text').each(function(i) {
                if(post.content_text && post.content_text[i]) {
                    $(this).text(post.content_text[i]);
                }
            });

            if($.isFunction(themeConfig.js)) {
                themeConfig.js($slide, post);
            }
        });


        $list.wrap('<div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"></div></div></div>');
        $list.closest('.swiper-container').addClass('scroll-v').swiper({
            mode: 'vertical',
            scrollContainer: true,
        });

        var nextLength = 1;

        var swiper = $swiperContainer.swiper({
            mode: 'horizontal',
            slideActiveClass: 'active',
            onSlideChangeStart: function(swiper) {
                $swiperContainer.addClass('moving');

                loadImages(swiper.slides.slice(swiper.activeIndex - nextLength, swiper.activeIndex + nextLength));
            },
            onSlideChangeEnd: function(swiper) {
                $swiperContainer.removeClass('moving');
            }
        });

        loadImages(swiper.slides.slice(0, nextLength + 1));
    }

    function initAds() {
        // 广告
        var $ads = $panel.find('.ads');

        // 点击"关闭"按钮关闭广告
        $ads.find('.js-ads-close').on('click', function(event) {
            $ads.addClass('out');
        });

        var swiper = $swiperContainer.data('swiper');
        if(swiper) {
            swiper.addCallback('SlideChangeStart', function(swiper) {
                $ads.addClass('out');
            });
        }

    }

    function initFooterBar(entity) {
        // 底部功能栏
        var $footerBar = $panel.find('.footer-bar');
        var $footerMenu = $panel.find('.footer-menu');

        var $footerBarMenu = $footerBar.find('.js-footer-bar-menu');
        var $footerBarClose = $footerBar.find('.js-footer-bar-close');

        var $mask = $('<div class="mask"/>');

        setOwner($footerMenu.find('.entity-owner'), entity.Owner);
        $footerMenu.find('.entity-joined span').text(entity.Posts.length + '/' + (entity.postLimit || '-'));

        // 点击"查看"
        $footerBarMenu.on('click', function(event) {
            $footerBarClose.show();
            $footerBarMenu.hide();

            $swiperContainer.addClass('blur');
            $footerMenu.addClass('in');

            $mask.appendTo($panel).on('click', footerMenuOut);
        });

        // 点击"关闭"
        $footerBarClose.on('click', footerMenuOut);

        // 点击"创建者"
        $footerMenu.find('.js-entity-owner').on('click', footerMenuOut);

        // 点击"加入人数"
        $footerMenu.find('.js-entity-joined').on('click', footerMenuOut);

        // 关闭底部菜单
        function footerMenuOut(event) {
            $footerBarClose.hide();
            $footerBarMenu.show();

            $swiperContainer.removeClass('blur');
            $footerMenu.removeClass('in');

            $mask.remove().off('click', footerMenuOut);
        }


        // 点击任意空白处"隐藏/展示"底部功能栏
        $swiperContainer.on('click', function() {
            if(!$swiperContainer.hasClass('moving')) {
                $footerBar.toggleClass('out');
            }
        });

        var swiper = $swiperContainer.data('swiper');
        if(swiper) {
            $footerMenu.find('.js-entity-owner').on('click', function(event) {
                swiper.swipeTo(0);
            });

            $footerMenu.find('.js-entity-joined').on('click', function(event) {
                swiper.swipeTo(1);
            });

            swiper.addCallback('SlideChangeStart', function(swiper) {
                $footerBar.addClass('out');
            });

            swiper.addCallback('SlideChangeEnd', function(swiper) {
                if(!swiper.activeIndex) {
                    $footerBar.removeClass('out');
                }
            });
        }

    }

    function loadImages(element) {
        $(element).find('.lazy').removeClass('lazy').each(function() {
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
