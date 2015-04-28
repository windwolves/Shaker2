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

    if(wechat) {
        wechat.auth(function(authedUser) {
            var url = urlObject();

            $.getJSON('/services/entity/' + url.segments[1], function(result) {
                if(result.status == 'success') {
                    initEntity(result.data, authedUser);
                }
                else {
                    console.error(result.data);
                }
            });
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


    function initEntity(entity, user) {
        new Entity({ entity: entity, user: user });
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

        this.$join = this.$panel.find(self.options.join.containerClass);


        this.entity = null;
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
        deps.push('/page/' + self.entity.Theme.code + '/js/index.js');

        require(deps, function(html, css, js) {
            var args = [].slice.call(arguments, 0);

            self.themeConfig = {
                html: html,
                js: js
            };

            self.showJoinPage();
        });

    };

    // 初始化分享
    Entity.prototype.initShare = function() {
        var self = this;

        if(!$('html').hasClass('wechat')) return;

        require(['wechat'], function(wechat) {
            wechat.init(location.href.split('#')[0], {
                imgUrl: (location.origin + self.entity.picture).replace(/.*http/g, 'http'),
                title: self.entity.title,
                description: self.entity.content
            });
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

        self.$panel.addClass(self.entity.Theme.code);

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
                $mask.attr('data-src', self.entity.picture);
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

        if($.isFunction(self.themeConfig.js)) {
            self.themeConfig.js($element, card);
        }

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
