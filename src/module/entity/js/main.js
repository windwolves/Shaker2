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

    var id = url.segments[2];

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

    var tapEventName = $('html').hasClass('desktop') ? 'dblclick' : 'tap';

    var transElement = document.createElement('trans');

    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
    };

    var transitionEndEventName = findEndEventName(transitionEndEventNames);

    function findEndEventName(endEventNames) {
        for (var name in endEventNames){
            if (transElement.style[name] !== undefined) {
                return endEventNames[name];
            }
        }
    }


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
            catalog: {
                containerClass: '.page-catalog',

                postCountClass: '.post-count',
                postListClass: '.post-list',
                postTemplateClass: '.post-item',
                postLikeCountClass: '.post-like_count span',
                postOwnerProfileClass: '.post-owner img',
                postOwnerNicknameClass: '.post-owner span',
                postContentClass: '.post-content',
                postPictureClass: '.post-picture',

                backClass: '.catalog-footer-bar-back'
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
            },
            join: {
                containerClass: '.page-join',

                contentClass: '.page-join-content',

                cardContentClass: '.content',
                cardPictureClass: '.picture',

                listClass: '.join-footer-bar-list',
                addClass: '.join-footer-bar-add',
                layoutClass: '.join-footer-bar-layout',
                publishClass: '.join-footer-bar-publish',

                closeClass: '.join-bar-close',
                saveClass: '.join-bar-save',

                cardListClass: '.card-list',
                layoutListClass: '.layout-list',

                previewListClass: '.preview-list',
                previewItemClass: '.preview-item',
                previewActiveItemClass: '.preview-item.active',
                previewItemRemoveClass: '.preview-item-remove',
            }
        };

        this.preLoadLength = 1;

        this.likeImgs = ['/module/entity/img/icon-like.png', '/module/entity/img/icon-like-active.png'];

        this.$panel = $(self.options.panelClass);

        this.$ads = this.$panel.find(self.options.ads.containerClass);

        this.$entity = this.$panel.find(self.options.entity.containerClass);
        this.$postPreTemplate = this.$entity.find(self.options.entity.templateClass).removeClass('hide').remove();

        this.$postTemplate = this.$panel.find(self.options.post.templateClass).removeClass('hide').remove();

        this.$catalog = this.$panel.find(self.options.catalog.containerClass);

        this.$join = this.$panel.find(self.options.join.containerClass);


        this.entity = null;
        this.user = null;
        this.themeConfig = null;

        this.joinCards = [];
        this.joinActiveCard = null;
        this.deletedJoinCards = [];

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
        // deps.push('/page/' + self.entity.Theme.code + '/js/index.js');

        require(deps, function(html, css, js) {
            var args = [].slice.call(arguments, 0);

            self.themeConfig = {
                html: html,
                // js: js
            };

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
            self.showCatalog();
        });

        self.$entity.find(self.options.entity.joinClass).on('click', function() {
            self.authUser(function() {
                self.showJoinPage();
            });
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

                // 翻到第5页是显示返回按钮
                if(swiper.activeIndex >= 5) {
                    $back.is(':hidden') && $back.fadeIn();
                }
                else {
                    $back.fadeOut();
                }
            },
            onSlideChangeEnd: function(swiper) {
                $container.removeClass('moving');
            }
        });

        var $back = self.$entity.find(options.backClass).on('click', function() {
            swiper.swipeTo(0);
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
        $topic.append(self.themeConfig.html);
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
            self.showPostPage(post, self.$entity);
        });

    };

    // 初始化广告
    Entity.prototype.showCatalog = function() {
        var self = this;
        var options = self.options.catalog;

        self.$catalog.removeClass('hide');

        if(!self.$catalog.find('.swiper-container').length) {
            // 参与人数
            self.$catalog.find(options.postCountClass).html(self.entity.Posts.length);


            var $list = self.$catalog.find(options.postListClass);
            var $itemTemplate = self.$catalog.find(options.postTemplateClass).removeClass('hide').remove();

            self.entity.Posts.forEach(function(post, index) {
                // 在目录中添加一行回复信息
                var $item = $itemTemplate.clone().appendTo($list);

                // 目录列表中点赞数
                $item.find(options.postLikeCountClass).text(post.likeCount);

                // 目录列表中参与人
                $item.find(options.postOwnerProfileClass).attr('src', post.Owner.profile);
                $item.find(options.postOwnerNicknameClass).text(post.Owner.nickname);

                var card = post.Cards[0];

                // 目录列表中内容
                if(card.contents && card.contents[0]) {
                    $item.find(options.postContentClass).text(card.contents[0]);
                }

                // 目录列表中图片
                if(card.pictures && card.pictures[0]) {
                    $item.find(options.postPictureClass).attr('src', card.pictures[0]);
                }

                // 点击目录列表进行跳转
                $item.on('click', function(event) {
                    self.showPostPage(post, self.$catalog);
                });
            });

            $list.wrap('<div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"></div></div></div>');
            $list.closest('.swiper-container').addClass('scroll-v').swiper({
                mode: 'vertical',
                scrollContainer: true
            });

            // 返回
            self.$catalog.find(options.backClass).on('click', function() {
                self.$entity.fadeIn();
                self.$catalog.fadeOut();
            });
        }

        self.$catalog.fadeIn();
        self.$entity.fadeOut();

    };

    // 显示回复的详情页面
    Entity.prototype.showPostPage = function(post, $back) {
        var self = this;
        var options = self.options.post;

        if(!post.$page) {
            var $page = post.$page = self.$postTemplate.clone().appendTo(self.$panel);

            var $container = $page.find(options.swiperContainerClass);
            var $wrapper = $page.find(options.swiperWrapperClass);

            // 返回
            $page.find(options.backClass).on('click', function() {
                $page.$back.fadeIn();
                $page.fadeOut();
            });

            // 页面序号
            var $cardIndex = $page.find(options.indexClass).text('1/' + post.Cards.length);

            // 页面设置
            post.Cards.forEach(function(card) {
                var $slide = $('<div class="swiper-slide"/>').appendTo($wrapper);
                self.setCard($slide, card);
            });

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
                    self.loadSwiperImages(swiper);
                    $cardIndex.text(swiper.activeIndex + 1 + '/' + swiper.slides.length);
                },
                onSlideChangeEnd: function(swiper) {
                    $container.removeClass('moving');
                }
            });

            self.loadSwiperImages(swiper);

            // 点赞数
            var $likeCount = $page.find(options.likeCountClass);

            // 点赞/取消点赞
            var $likeCountImg = $likeCount.find('img');
            var $lkeCountSpan = $likeCount.find('span').text(post.likeCount);

            // @todo 判断是否已经点赞
            if(post.likeCount > 0) {
                $likeCount.addClass('active');
                $likeCountImg.attr('src', self.likeImgs[1]);
            }
            $likeCount.on('click', function() {
                // @todo 点赞或取消点赞
                if($likeCount.hasClass('active')) {
                    post.likeCount--;
                    $likeCountImg.attr('src', self.likeImgs[0]);
                }
                else {
                    post.likeCount++;
                    $likeCountImg.attr('src', self.likeImgs[1]);
                }
                $likeCount.toggleClass('active');
                $lkeCountSpan.text(post.likeCount);
            });
        }

        post.$page.$back = $back;

        post.$page.fadeIn();
        post.$page.$back.fadeOut();

        post.$page.find(options.swiperContainerClass).data('swiper').swipeTo(0);

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

    // 验证用户授权
    Entity.prototype.authUser = function(callback) {
        var self = this;

        if(location.hostname == '192.168.1.108') {
            self.user = {
                username: 'admin',
                password: '21232f297a57a5a743894a0e4a801fc3'
            };

            callback();
            return;
        }

        if(!$('html').hasClass('wechat')) return;

        if(!self.user) {
            require(['wechat'], function(wechat) {
                wechat.auth(function(authedUser) {
                    self.user = authedUser;
                    callback();
                });
            });
        }
        else {
            callback();
        }

    };

    Entity.prototype.showJoinPage = function() {
        var self = this;
        var options = self.options.join;

        if(!self.entity.Theme.Layouts) {

            $.getJSON('/services/theme/' + self.entity.themeId, function(result) {
                if(result.status != 'success') return;

                self.entity.Theme = result.data;

                self.addJoinCard();
            });

            self.$join.find(options.listClass).on('click', function() {
                self.showJoinCardList();
            });

            self.$join.find(options.addClass).on('click', function() {
                self.addJoinCard();
            });

            self.$join.find(options.layoutClass).on('click', function() {
                self.showJoinLayoutList();
            });

            self.$join.find(options.publishClass).on('click', function() {
                // @todo 发布
                var cards = [];

                self.joinCards.forEach(function(d) {
                    cards.push({
                        contents: d.contents,
                        pictures: d.pictures,
                        layoutId: d.Layout.id
                    });
                });

                var userAccess = $.param({ _username: self.user.username, _password: self.user.password });
                var data = { entityId: self.entity.id, cards: cards };

                $.post('/services/post?' + userAccess, data, function(result) {
                    if(result.status == 'success') {
                        location.href = location.href.replace(location.search, '') + '?pid=' + result.data.id;
                    }
                    else {
                        console.error(result);
                    }

                });
            });
        }

        self.$join.fadeIn();
        self.$entity.fadeOut();

    };

    Entity.prototype.addJoinCard = function() {
        var self = this;

        var layout = self.entity.Theme.Layouts[0];
        var card = { layoutId: layout.id, Layout: layout, contents: [], pictures: [] };

        self.joinCards.push(card);
        self.showJoinCard(card);
        self.joinActiveCard = card;

        self.addJoinCardElement(card);
    };

    Entity.prototype.addJoinCardElement = function(card) {
        var self = this;
        var options = self.options.join;

        var $list = self.$join.find(options.cardListClass).find(options.previewListClass);

        var src = '/page/' + self.entity.Theme.code + '/img/' + card.Layout.code + '.png';
        var $item = $('<div class="preview-item"><img src="' + src + '"/></div>').appendTo($list);

        $list.find(options.previewItemClass + '.active').removeClass('active');
        if(card == self.joinActiveCard) {
            $item.addClass('active');
        }

        $item.on(tapEventName, function() {
            $list.find(options.previewActiveItemClass).removeClass('active');
            $item.addClass('active');

            self.showJoinCard(card);
            self.joinActiveCard = card;
        });

        $('<div class="preview-item-remove" />').appendTo($item).on('click', function() {
            var index = self.joinCards.indexOf(card);

            self.deletedJoinCards.push([index, card]);
            self.joinCards.splice(index, 1);
            $item.remove();

            if(self.joinActiveCard == card) {
                self.showJoinCard(self.joinCards[0]);
            }

            if(self.joinCards.length == 1) {
                $list.find(options.previewItemRemoveClass).hide();
            }
        });
    };

    Entity.prototype.showJoinCard = function(card) {
        var self = this;
        var options = self.options.join;

        var $content = self.$join.find(options.contentClass);

        if(self.joinActiveCard) {
            $content.find(self.options.visibleWrapperClass).find('.input-content').trigger('blur');
        }

        if(self.joinActiveCard != card) {
            if(self.joinActiveCard) {
                $content.removeClass(self.joinActiveCard.Layout.code);
            }

            $content.html(self.themeConfig.html);

            $content.find(options.cardContentClass).each(function() {
                $('<textarea class="input-content"/>').attr('placeholder', '输入内容').appendTo($(this)).on('blur', function() {
                    $content.find(self.options.visibleWrapperClass).find(options.cardContentClass).each(function(i) {
                        card.contents[i] = $(this).find('.input-content').val();
                    });
                }).on(tapEventName, function(evt) {
                    return false;
                });
            });

            $content.find(self.options.wrapperClass).each(function() {
                $(this).find(options.cardPictureClass).each(function(i) {
                    $(this).data('picture-index', i);
                });
            });
        }

        self.initPictureElement($content.find(options.cardPictureClass));

        $content.addClass(card.Layout.code);

        var $wrapper = $content.find(self.options.visibleWrapperClass);

        // 设置内容
        $wrapper.find(options.cardContentClass).each(function(i) {
            if(card.contents && card.contents[i]) {
                $(this).find('.input-content').val(card.contents[i]);
            }
        });

        // 设置图片
        $wrapper.find(options.cardPictureClass).each(function(i) {
            if(card.pictures && card.pictures[i]) {
                $(this).attr('data-src', card.pictures[i]);
                self.loadImage(this);
            }
        });

    };

    Entity.prototype.showJoinCardList = function(activeCard) {
        var self = this;
        var options = self.options.join;

        var $content = self.$join.find(options.contentClass).addClass('smaller');
        var $element = self.$join.find(options.cardListClass).addClass('in');

        self.deletedJoinCards = [];

        if(!$element.hasClass('loaded')) {
            $element.find(options.closeClass).on('click', function() {
                for(var i = self.deletedJoinCards.length - 1; i >= 0; i--) {
                    self.joinCards.splice(self.deletedJoinCards[i][0], 0, self.deletedJoinCards[i][1]);
                }

                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            $element.find(options.saveClass).on('click', function() {
                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            $content.on(tapEventName, function() {
                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            $element.addClass('loaded');
        }

        var $list = $element.find(options.previewListClass);
        var $children = $list.children();
        var $swiperContainer = $list.closest('.swiper-container');

        var src = '/page/' + self.entity.Theme.code + '/img/' + self.joinActiveCard.Layout.code + '.png';
        $list.find(options.previewActiveItemClass).find('img').attr('src', src);

        var scroll = $swiperContainer.data('swiper');

        if(!scroll) {
            scroll = $swiperContainer.addClass('scroll-h').swiper({
                mode: 'horizontal',
                scrollContainer: true
            });
        }
        else {
            self.joinCards.slice($children.length).forEach(function(card) {
                self.addJoinCardElement(card);
            });
        }

        if(self.joinCards.length == 1) {
            $list.find(options.previewItemRemoveClass).hide();
        }

        var reInitScroll = function() {
            $children = $list.children();
            $list.width($children.eq(0).width() * $children.length + 5);
            scroll.reInit();

            $element.off(transitionEndEventName, reInitScroll);
        };

        $element.on(transitionEndEventName, reInitScroll);

    };

    Entity.prototype.showJoinLayoutList = function() {
        var self = this;
        var options = self.options.join;

        var theme = self.entity.Theme;

        var $content = self.$join.find(options.contentClass).addClass('smaller');
        var $element = self.$join.find(options.layoutListClass).addClass('in');
        var $list = $element.find(options.previewListClass);

        if(!$element.hasClass('loaded')) {
            $element.find(options.closeClass).on('click', function() {
                if(self.joinActiveCard_origin) {
                    $content.removeClass(self.joinActiveCard.Layout.code);
                    $.extend(self.joinActiveCard, self.joinActiveCard_origin);
                    self.joinActiveCard_origin = null;

                    self.showJoinCard(self.joinActiveCard);
                }

                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            $element.find(options.saveClass).on('click', function() {
                self.joinActiveCard_origin = null;

                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            $content.on(tapEventName, function() {
                self.joinActiveCard_origin = null;

                $element.removeClass('in');
                $content.removeClass('smaller');
            });

            theme.Layouts.forEach(function(layout, index) {
                var src = '/page/' + theme.code + '/img/' + layout.code + '.png';
                var $item = $('<div class="preview-item"><img src="' + src + '" /></div>').appendTo($list);

                $item.on(tapEventName, function() {
                    var $oldItem = $list.find(options.previewActiveItemClass).removeClass('active');
                    $content.removeClass(theme.Layouts[$oldItem.index()].code);

                    $item.addClass('active');

                    $content.find(self.options.visibleWrapperClass).find('.input-content').trigger('blur');

                    if(!self.joinActiveCard_origin) {
                        self.joinActiveCard_origin = $.extend({}, self.joinActiveCard);
                    }

                    self.joinActiveCard.layoutId = layout.id;
                    self.joinActiveCard.Layout = layout;

                    self.showJoinCard(self.joinActiveCard);

                    // self.initPictureElement($content.find(options.cardPictureClass));
                });
            });

            var scroll = $list.closest('.swiper-container').addClass('scroll-h').swiper({
                mode: 'horizontal',
                scrollContainer: true
            });

            var reInitScroll = function() {
                var children = $list.children();
                $list.width(children.eq(0).width() * children.length + 5);
                scroll.reInit();

                $element.off(transitionEndEventName, reInitScroll);
            };

            $element.on(transitionEndEventName, reInitScroll);

            $element.addClass('loaded');
        }

        $list.find(options.previewActiveItemClass).removeClass('active');

        theme.Layouts.forEach(function(layout, index) {
            if(layout.code == self.joinActiveCard.Layout.code) {
                $list.find(options.previewItemClass).eq(index).addClass('active');
            }
        });

    };

    Entity.prototype.initPictureElement = function($element) {
        var self = this;

        var callbacks = [];

        var execCallbacks = function() {
            for(var i = 0, n = callbacks.length; i < n; i++) {
                callbacks[i]();
            }

            callbacks = [];
        };

        var initUploadMask = function($element, picture) {
            var flow = new self.Flow({
                target: '/upload',
                chunkSize: 1024 * 1024,
                testChunks: false
            });

            $element.html('').append($('<div class="picture-tip"/>').text('点击更换图片'));
            var $mask = $('<div class="picture-mask"/>').prependTo($element);

            if(picture) {
                $mask.attr('data-src', picture);
            }
            else {
                $mask.addClass('blur').attr('data-src', self.entity.picture);
            }

            self.loadImage($mask[0]);

            flow.assignBrowse($mask[0], false, true, { accept: 'image/*' });

            flow.on('filesSubmitted', function(file) {
                flow.upload();
            });

            flow.on('fileSuccess', function(file, message){
                try {
                    var result = JSON.parse(message);

                    if(result.status == 'success') {
                        var src = result.data[0].replace(/\\/g, '/');
                        self.joinActiveCard.pictures[$element.data('picture-index')] = src;
                        initUploadMask($element, src);
                    }
                    else {
                        console.log(result);
                    }
                }
                catch(ex) {
                    console.error(message);
                }
            });
        };

        $element.each(function(index) {
            var $this = $(this);

            callbacks.push(function() {
                initUploadMask($this, self.joinActiveCard.pictures[$this.data('picture-index')]);
            });

            if(self.Flow) {
                setTimeout(execCallbacks, 0);
            }
            else if(!self.isLoadingFlow) {
                self.isLoadingFlow = true;

                require(['flow'], function(Flow) {
                    self.Flow = Flow;
                    execCallbacks();
                });
            }
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
        $element.append(self.themeConfig.html);
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

        // if($.isFunction(self.themeConfig.js)) {
        //     self.themeConfig.js($element, card);
        // }

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
        return 'transparent url(' + imageSrc + ') 0 0 / 100% 100% no-repeat';
    };

});
