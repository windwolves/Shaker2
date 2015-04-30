$(function() {
    'use strict';

    var user;

    var id = location.pathname.split('/').slice(1)[1];

    if(typeof wechat === 'undefined') return;

    wechat.auth(function(authedUser) {
        user = authedUser;

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
    });

    // user = {
    //     username: 'admin',
    //     password: '21232f297a57a5a743894a0e4a801fc3'
    // };

    // $.getJSON('/services/entity/' + id, function(result) {
    //     if(result.status == 'success') {
    //         var entity = result.data;

    //         $.getJSON('/services/theme/' + entity.themeId, function(result) {
    //             if(result.status != 'success') return;

    //             entity.Theme = result.data;

    //             initEntity(entity);
    //         });
    //     }
    //     else {
    //         console.error(result.data);
    //     }
    // });


    var $panel, $preview, $cardList, $layoutList;

    var swiper;

    var post = { cards: [] };

    var defaultPictrue = '/entity/join/img/picture-placeholder.jpg';

    function initEntity(entity) {
        post.entity = entity;

        $('<link rel="stylesheet"/>').attr('href', '/page/' + entity.Theme.code + '/css/style.css').appendTo('head');

        $.get('/page/' + entity.Theme.code + '/index.html', function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo('body');

            initPanel();
            initPreview();
            initCardList();
            initLayoutList();

            addCard();
        });
    }


    function initPanel() {
        $panel = $('.panel');

        $panel.find('.join-footer-bar-list').on('click', function() {
            updateCardList();

            $preview.addClass('smaller');
            $cardList.addClass('in');
        });

        $panel.find('.join-footer-bar-add').on('click', function() {
            addCard();
        });

        $panel.find('.join-footer-bar-layout').on('click', function() {
            updateLayoutList(post.cards[swiper.activeIndex]);

            $preview.addClass('smaller');
            $layoutList.addClass('in');
        });

        $panel.find('.join-footer-bar-publish').on('click', function() {
            var cards = [];

            var isValid = post.cards.every(function(card, index) {
                cards.push({
                    contents: card.contents,
                    pictures: card.pictures,
                    layoutId: card.Layout.id
                });

                var uploadPictrues = card.pictures.filter(function(p) {
                    return p != defaultPictrue;
                });

                var mustUploadLength = $(swiper.slides[index]).find('.picture').length;

                if(uploadPictrues.length < mustUploadLength) {
                    swiper.slideTo(index);
                    alert('请先上传图片再发布！');
                    return false;
                }
                return true;
            });

            if(!isValid) return;

            var userAccess = $.param({ _username: user.username, _password: user.password });
            var data = { entityId: post.entity.id, cards: cards };

            $.post('/services/post?' + userAccess, data, function(result) {
                if(result.status == 'success') {
                    location.href = '/entity/' + result.data.entityId + '?pid=' + result.data.id;
                }
                else {
                    console.error(result);
                }

            });
        });
    }


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

    function updateCard(card) {
        var index = post.cards.indexOf(card);

        if(swiper) {
            swiper.slides[index].innerHTML = template('card-template', card);
            swiper.lazy.loadImageInSlide(index);

            initSlide($(swiper.slides[index]), card);
        }
    }


    function initCardList() {
        $cardList = $('.card-list');

        var $container = $cardList.find('.swiper-container');

        var oldHeight = $container.height();
        var newHeight = $panel.height();

        var scale = oldHeight / newHeight;

        $container.css({ width: $panel.width(), height: newHeight, transform: 'scale(' + scale + ')' });

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

    function initSlide($slide, card) {
        $slide.find('.picture').each(function(index) {
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
