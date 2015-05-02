$(function() {
    'use strict';

    if(typeof wechat !== 'undefined') {
        wechat.auth(setUser);
    }
    // else {
    //     var wechat = { share: function() {} };

    //     setUser({
    //         username: 'admin',
    //         password: '21232f297a57a5a743894a0e4a801fc3'
    //     });
    // }

    var user;

    var $panel, $preview, $cardList, $layoutList;

    var swiper;

    var post = { cards: [] };

    var defaultPictrue = '/entity/join/img/picture-placeholder.jpg';

    // 设置用户信息
    function setUser(authedUser) {
        user = authedUser;

        var id = location.pathname.split('/').slice(1)[1];

        $.getJSON('/services/entity/' + id, function(result) {
            if(result.status == 'success') {
                var entity = result.data;

                $.getJSON('/services/theme/' + entity.themeId, function(result) {
                    if(result.status != 'success') return;

                    entity.Theme = result.data;

                    initEntity(entity);
                });
            }
            else {
                console.error(result.data);
            }
        });
    }

    // 加载主题模板内容，初始化页面
    function initEntity(entity) {
        post.entity = entity;

        wechat.share({
            link: location.origin + '/entity/' + entity.id,
            imgUrl: (location.origin + entity.picture).replace(/.*http/g, 'http'),
            title: entity.title,
            description: entity.content
        });

        $('<link rel="stylesheet"/>').attr('href', '/page/' + entity.Theme.code + '/css/style.css').appendTo('head');

        $.get('/page/' + entity.Theme.code + '/index.html', function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo('body');

            $panel = $('.panel');

            initFooterBar();
            initPreview();
            initCardList();
            initLayoutList();

            addCard();
        });
    }

    // 初始化底部导航栏
    function initFooterBar() {
        var $footer = $('.join-footer-bar');

        $footer.find('.join-footer-bar-list').on('click', function() {
            updateCardList();

            $preview.addClass('smaller');
            $cardList.addClass('in');
        });

        $footer.find('.join-footer-bar-add').on('click', function() {
            addCard();
        });

        $footer.find('.join-footer-bar-layout').on('click', function() {
            updateLayoutList(post.cards[swiper.activeIndex]);

            $preview.addClass('smaller');
            $layoutList.addClass('in');
        });

        $footer.find('.join-footer-bar-publish').on('click', function() {
            var cards = [];

            var isValid = post.cards.every(function(card, index) {
                cards.push({
                    contents: card.contents,
                    pictures: card.pictures,
                    layoutId: card.Layout.id
                });

                var $slide = $(swiper.slides[index]);

                var mustUploadLength = $slide.find('.picture').length;
                var mustEnterTextLength = $slide.find('.content').length;

                var uploadPictrues = card.pictures.filter(function(d) {
                    return d != defaultPictrue;
                });

                var enterContents = card.contents.filter(function(d) {
                    return d;
                });

                if(mustUploadLength) {
                    if(uploadPictrues.length < mustUploadLength) {
                        swiper.slideTo(index);
                        alert('请先上传图片再发布！');
                        return false;
                    }
                }
                else if(enterContents.length < mustEnterTextLength) {
                    swiper.slideTo(index);
                    alert('请先上传填写文字再发布！');
                    return false;
                }

                return true;
            });

            if(!isValid) return;

            var userAccess = $.param({ _username: user.username, _password: user.password });
            var data = { entityId: post.entity.id, cards: cards };

            $.post('/services/post?' + userAccess, data, function(result) {
                if(result.status == 'success') {
                    location.href = '/entity/' + result.data.entityId + '/joined/' + result.data.id;
                }
                else {
                    console.error(result);
                }

            });
        });
    }

    // 初始化主要预览区域
    function initPreview() {
        $preview = $('.preview-container').append(template('preview-template', post));

        swiper = new Swiper($preview[0], {
            preloadImages: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingOnTransitionStart: true,
            onTap: function() {
                $preview.removeClass('smaller');
                $cardList.removeClass('in');
                $layoutList.removeClass('in');
            }
        });
    }

    // 初始化卡片缩略图列表
    function initCardList() {
        $cardList = $('.card-list');

        var $container = $cardList.find('.swiper-container');

        var oldHeight = $container.height();
        var newHeight = $panel.height();

        var scale = oldHeight / newHeight;

        $container.css({ height: newHeight, transform: 'scale(' + scale + ')' });

        $cardList.find('.join-bar-close').on('click', function() {
            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        $cardList.find('.join-bar-save').on('click', function() {
            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        $cardList.on('click', '.join-bar-remove', function() {
            var index = $(this).parent().index();

            post.cards.splice(index, 1);
            updateCardList();
        });
    }

    // 更新卡片缩略图列表
    function updateCardList() {
        var $container = $('.card-list .swiper-container').html(template('card-list-template', post));

        new Swiper($container[0], {
            slideActiveClass: 'active',
            initialSlide: swiper.activeIndex,
            spaceBetween: 200,
            slideToClickedSlide: true,
            preloadImages: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingOnTransitionStart: true,
            onSlideChangeStart: function(cardSwiper) {
                swiper.slideTo(cardSwiper.activeIndex);
            }
        });
    }

    // 初始化版式缩略图列表
    function initLayoutList() {
        $layoutList = $('.layout-list');

        $layoutList.find('.join-bar-close').on('click', function() {
            $preview.removeClass('smaller');
            $layoutList.removeClass('in');
        });

        $layoutList.find('.join-bar-save').on('click', function() {
            $preview.removeClass('smaller');
            $layoutList.removeClass('in');
        });
    }

    // 更新版式缩略图列表
    function updateLayoutList(card) {
        var theme = post.entity.Theme;

        var $container = $('.layout-list .swiper-container').html(template('layout-list-template', theme));

        var i, n;
        for(i = 0, n = theme.Layouts.length; i < n; i++) {
            if(card.Layout.code == theme.Layouts[i].code) {
                break;
            }
        }

        new Swiper($container[0], {
            slideActiveClass: 'active',
            initialSlide: i,
            slidesPerView: 3,
            centeredSlides: true,
            slideToClickedSlide: true,
            onTap: function(swiper) {
                var index = swiper.activeIndex;
                var layout = theme.Layouts[index];

                card.Layout = layout;
                card.layoutId = layout.id;

                updateCard(card);
            }
        });
    }

    // 添加卡片
    function addCard() {
        var layout = post.entity.Theme.Layouts[0];
        var card = { layoutId: layout.id, Layout: layout, contents: [], pictures: [defaultPictrue] };

        post.cards.push(card);

        if(swiper) {
            swiper.appendSlide('<div class="swiper-slide">' + template('card-template', card) + '</div>');

            var slideIndex = swiper.slides.length - 1;
            var $slide = $(swiper.slides[slideIndex]);

            swiper.slideTo(slideIndex);
            swiper.lazy.loadImageInSlide(slideIndex);

            initSlide($slide, card);
        }
    }

    // 更新主要预览区域卡片
    function updateCard(card) {
        var index = post.cards.indexOf(card);

        if(swiper) {
            swiper.slides[index].innerHTML = template('card-template', card);
            swiper.lazy.loadImageInSlide(index);

            initSlide($(swiper.slides[index]), card);
        }
    }

    // 预览区域Slide设置
    function initSlide($slide, card) {
        $slide.find('.picture').each(function(index) {
            if(card.pictures[index] != defaultPictrue) {
                $(this).addClass('uploaded');
            }

            initUpload(this, card, index);
        });

        $slide.find('.content').each(function(i) {
            var $this = $(this);
            var val = $this.html();

            $this.html('');

            var $textarea = $('<textarea class="input-content"/>').attr('placeholder', '输入内容').appendTo($this);

            $textarea.val(val);

            $textarea.on('blur', function() {
                card.contents[i] = $textarea.val();
            });
        });
    }

    // 上传图片设置
    function initUpload(element, card, index) {
        var flow = new Flow({
            target: '/upload',
            chunkSize: 1024 * 1024,
            testChunks: false
        });

        flow.assignBrowse(element, false, true, { accept: 'image/*' });

        flow.on('filesSubmitted', function(file) {
            flow.upload();
        });

        flow.on('fileSuccess', function(file, message){
            try {
                var result = JSON.parse(message);

                if(result.status == 'success') {
                    var src = result.data[0].replace(/\\/g, '/');
                    card.pictures[index] = src;

                    updateCard(card);
                }
                else {
                    console.log(result);
                }
            }
            catch(ex) {
                console.error(message);
            }
        });
    }

});
