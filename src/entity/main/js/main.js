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
        new Entity({ entity: entity });
    }

    // Entity类
    function Entity(options) {
        var self = this;

        self.options = {
            panelClass: '.panel',
            wrapperClass: '.wrapper',
            hiddenWrapperClass: '.wrapper:hidden',
            visibleWrapperClass: '.wrapper:visible',
            ads: {
                containerClass: '.ads',
                closeClass: '.ads-close'
            },
            entity: {
                containerClass: '.page-entity',
                swiperContainerClass: '.swiper-container',
                swiperWrapperClass: '.swiper-wrapper',
                slideInnerClass: '.slide-inner',

                coverContainerClass: '.topic',
                templateClass: '.post-slide',

                ownerIndexClass: '.owner-index',
                ownerProfileClass: '.owner-profile',
                ownerNicknameClass: '.owner-nickname',

                likeCountClass: '.entity-post-like_count span',
                cardCountClass: '.entity-post-cards span',

                coverLikeCountClass: '.entity-like_count span',
                coverJoinedCountClass: '.entity-joined span',

                titleClass: '.title',
                contentClass: '.content',
                pictureClass: '.picture',

                catalogClass: '.footer-bar-catalog',
                joinClass: '.footer-bar-join',
                backClass: '.page-entity-back'
            },
            post: {
                templateClass: '.page-post',
                swiperContainerClass: '.swiper-container',
                swiperWrapperClass: '.swiper-wrapper',

                backClass: '.post-footer-bar-back',
                indexClass: '.post-card-index',
                likeCountClass: '.post-like_count'
            },
            card: {
                contentClass: '.content',
                pictureClass: '.picture'
            }
        };

        this.preLoadLength = 1;

        this.$panel = $(self.options.panelClass);

        this.$ads = this.$panel.find(self.options.ads.containerClass);

        this.$entity = this.$panel.find(self.options.entity.containerClass);
        this.$postPreTemplate = this.$entity.find(self.options.entity.templateClass).removeClass('hide').remove();


        this.entity = null;
        this.themeTemplate = null;

        $.extend(true, self, options);

        self.init();

    }

    // 初始化
    Entity.prototype.init = function() {
        var self = this;

        document.title = self.entity.title;

        $(window).on('scroll', function(evt) {
            evt.preventDefault();
        }).on('touchmove', function(evt) {
            evt.preventDefault();
        }).on('mousemove', 'img', function(evt) {
            evt.preventDefault();
        });

        self.initShare();


        var deps = [];

        deps.push('text!/page/' + self.entity.Theme.code + '/index.html');
        deps.push('css!/page/' + self.entity.Theme.code + '/css/style.css');

        require(deps, function(html) {
            var args = [].slice.call(arguments, 0);

            self.themeTemplate = html;

            self.initAds();
            self.initEntityBar();
            self.initEntitySwiper();
        });

    };

    // 初始化广告
    Entity.prototype.initAds = function() {
        var self = this;

        // 点击"关闭"按钮关闭广告
        self.$panel.find(self.options.ads.closeClass).on('click', function(event) {
            self.$ads.addClass('out');
        });

        setTimeout(function() {
            // 翻页时隐藏广告
            self.$ads.addClass('out');
        }, 3000);

    };

    // 初始化首页的底部功能栏
    Entity.prototype.initEntityBar = function() {
        var self = this;

        // 底部功能栏
        self.$entity.find(self.options.entity.catalogClass).on('click', function() {
            location.href = '/entity/' + self.entity.id + '/catalog';
        });

        // 底部功能栏
        self.$entity.find('.logo').on('click', function() {
            self.swiper.swipeTo(0);
        });

        self.$entity.find(self.options.entity.joinClass).on('click', function() {
            location.href = '/entity/' + self.entity.id + '/join';
        });

    };

    // 初始化 swiper
    Entity.prototype.initEntitySwiper = function() {
        var self = this;
        var options = self.options.entity;

        var $container = self.$entity.find(options.swiperContainerClass);
        var $wrapper = $container.find(options.swiperWrapperClass);

        self.$panel.addClass(self.entity.Theme.code);

        // 封面页
        self.initEntityCover();

        // 参与页
        var activeIndex;
        self.entity.Posts.forEach(function(post, index) {
            var $slide = self.$postPreTemplate.clone().appendTo($wrapper).find(options.slideInnerClass);

            self.initEntityPost($slide, post, index);

            if(post.id == url.params.pid) {
                activeIndex = index + 1;
            }
        });


        var swiper = self.swiper = $container.swiper({
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
                self.loadSwiperImages(swiper);
            },
            onSlideChangeEnd: function(swiper) {
                $container.removeClass('moving');
            }
        });

        self.loadSwiperImages(swiper);

        if(activeIndex) {
            swiper.swipeTo(activeIndex);
        }

    };

    // 初始化封面
    Entity.prototype.initEntityCover = function() {
        var self = this;
        var options = self.options.entity;

        // 首页
        var $topic = self.$entity.find(options.coverContainerClass).addClass(self.entity.Theme.code + '-cover');

        // 发起人信息
        $topic.find(options.ownerProfileClass).attr('src', self.entity.Owner.profile);
        $topic.find(options.ownerNicknameClass).text(self.entity.Owner.nickname);

        // 点赞数
        $topic.find(options.coverLikeCountClass).text(self.entity.likeCount);

        // 参与人数
        $topic.find(options.coverJoinedCountClass).text(self.entity.Posts.length);


        // 首页内容
        $topic.append(self.themeTemplate);
        $topic.find(self.options.hiddenWrapperClass).remove();

        $topic.find(options.titleClass).text(self.entity.title);
        $topic.find(options.contentClass).text(self.entity.content);
        $topic.find(options.pictureClass).addClass('lazy').attr('data-src', self.entity.picture);

    };

    // 初始化回复的预览页面
    Entity.prototype.initEntityPost = function($element, post, index) {
        var self = this;
        var options = self.options.entity;

        // 发起人信息
        $element.find(options.ownerIndexClass).text(index + 1 + '号');
        $element.find(options.ownerProfileClass).attr('src', post.Owner.profile);
        $element.find(options.ownerNicknameClass).text(post.Owner.nickname);

        // 点赞数
        $element.find(options.likeCountClass).text(post.likeCount);

        // 页数
        $element.find(options.cardCountClass).text(post.Cards.length);

        // 显示回复的第一个页面
        post.Cards[0] && self.setCard($element, post.Cards[0]);

        // 浏览回复的所有页面
        $element.on(tapEventName, function(evt) {
            location.href = '/post/' + post.id;
        });

    };

    // 初始化分享
    Entity.prototype.initShare = function() {
        var self = this;

        if(!wechat) return;

        wechat.init(location.href.split('#')[0], {
            imgUrl: (location.origin + self.entity.picture).replace(/.*http/g, 'http'),
            title: self.entity.title,
            description: self.entity.content
        });

    };

    // 设置卡片信息
    Entity.prototype.setCard = function($element, card) {
        var self = this;
        var options = self.options.card;

        var skin = card.Skin && card.Skin.code;
        var layout = card.Layout.code;

        $element.addClass(layout).addClass(skin);

        // 绑定模板
        $element.append(self.themeTemplate);
        $element.find(self.options.hiddenWrapperClass).remove();

        // 设置内容
        $element.find(options.contentClass).each(function(i) {
            if(card.contents && card.contents[i]) {
                $(this).text(card.contents[i]);
            }
        });

        // 设置图片
        $element.find(options.pictureClass).each(function(i) {
            if(card.pictures && card.pictures[i]) {
                $(this).addClass('lazy').attr('data-src', card.pictures[i]);
            }
        });

    };

    Entity.prototype.loadSwiperImages = function(swiper) {
        var self = this;

        var index = swiper.activeIndex;
        var start = index - self.preLoadLength > 0 ? index - self.preLoadLength : 0;
        var end = index + self.preLoadLength < swiper.slides.length ? index + self.preLoadLength : swiper.slides.length;

        $(swiper.slides.slice(start, end)).find('.lazy').removeClass('lazy').each(function() {
            self.loadImage(this);
        });

    };

    Entity.prototype.loadImage = function(element) {
        var self = this;
        var $element = $(element);
        var src = $element.attr('data-src');

        if(element.tagName.toLowerCase() == 'img') {
            $element.attr('src', src);
        }
        else {
            $element.css('background', self.getBackground(src));
        }

    };

    Entity.prototype.getBackground = function(imageSrc) {
        return 'transparent url(' + imageSrc + ') 50% 50% / cover no-repeat';
    };

});
