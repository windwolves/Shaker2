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

    var id = getQueryID();

    if(id == 'demo') {
        initEntity({
            'title': '',
            'content': '',
            'theme': { 'code': 'theme_01' },
            'posts': [{
                'skin': { 'code': 'skin_02' },
                'layout': { 'code': 'layout_01' },
                'content_pic': ['/page/theme_01/img/skin_02.png'],
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

    function getQueryID() {
        var result = location.href.match(/entity\/([0-9a-zA-Z\-]+)/);

        if(!result || result.length < 1){
            return '';
        }

        return result[1];
    }

    function initEntity(entity) {
        if(!entity) return;
        document.title = entity.title;

        initWechatConfig({}, function() {
            initWechatShare({
                imgUrl: location.origin,
                title: entity.title,
                description: entity.content
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

        deps.push('text!/page/' + entity.theme.code + '/index.html');
        deps.push('css!/page/' + entity.theme.code + '/css/style.css');
        deps.push('/page/' + entity.theme.code + '/js/index.js');

        initPanel(entity);

        require(deps, function(html, css, js) {
            var args = [].slice.call(arguments, 0);

            var theme = {
                html: html,
                js: js
            };

            initPages(entity.posts, theme);
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

    function initPanel(entity) {
        // @todo 显示“标题”和“点赞数”和“发起人”等信息
        $('.panel').addClass(entity.theme.code);
    }

    function initPages(posts, theme) {
        var $panel = $('.panel');
        var $swiperContainer = $('<div class="swiper-container"/>').appendTo($panel);
        var $swiperWrapper = $('<div class="swiper-wrapper"/>').appendTo($swiperContainer);

        posts.forEach(function(post, index) {
            var skin = post.skin.code;
            var layout = post.layout.code;

            var $slide = $('<div class="swiper-slide"/>').addClass(skin).addClass(layout).appendTo($swiperWrapper);

            $slide.html(theme.html);

            $slide.find('.text').each(function(i) {
                if(post.content_text && post.content_text[i]) {
                    $(this).text(post.content_text[i]);
                }
            });

            $slide.find('.photo').each(function(i) {
                if(post.content_pic && post.content_pic[i]) {
                    $(this).addClass('lazy').attr('data-src', post.content_pic[i]);
                }
            });

            if($.isFunction(theme.js)) {
                theme.js($slide, post);
            }
        });

        initSwiper($swiperContainer);
    }

    function initSwiper($element, callbacks) {
        var nextLength = 1;

        var swiper = $element.swiper({
            mode: 'vertical',
            slideActiveClass: 'active',
            onSlideChangeStart: function(swiper) {
                loadImages(swiper.slides[swiper.activeIndex + nextLength]);
            }
        });

        loadImages(swiper.slides.slice(0, nextLength + 1));
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

});
