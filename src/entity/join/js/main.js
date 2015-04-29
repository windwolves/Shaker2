require.config({
    baseUrl: '/module/entity',
    paths: {
        'text': '/lib/require-text',
        'css': '/lib/require-css',
        'jquery': '/lib/zepto',
        'template': '/lib/template',
        'swiper': '/lib/swiper',
        'urlobject': '/js/urlobject',
        'wechat': '/js/wechat',
        'device': '/js/device',
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'wechat': ['jquery']
    },
    waitSeconds: 15
});


require([
    'jquery',
    'template',
    'urlobject',
    'wechat',
    'swiper',
    'device'
], function($, template, urlObject, wechat, Swiper) {
    'use strict';

    // if(!wechat) return;

    // var url = urlObject();
    // var user;

    // wechat.auth(function(authedUser) {
    //     user = authedUser;

    //     $.getJSON('/services/entity/' + url.segments[1], function(result) {
    //         if(result.status == 'success') {
    //             initEntity(result.data);
    //         }
    //         else {
    //             console.error(result.data);
    //         }
    //     });
    // });


    var url = urlObject();
    var user = {
        username: 'admin',
        password: '21232f297a57a5a743894a0e4a801fc3'
    };

    $.getJSON('/services/entity/' + url.segments[1], function(result) {
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


    var swiper;
    var $preview;
    var post = { cards: [] };

    function initEntity(entity) {
        var deps = [
            'text!/page/' + entity.Theme.code + '/index.html',
            'css!/page/' + entity.Theme.code + '/css/style.css'
        ];

        post.entity = entity;

        require(deps, function(cardTemplate) {
            $('<script id="card-template" type="text/html"/>').html(cardTemplate).appendTo($('body'));

            var $panel = $('.panel');
            $preview = $('.preview-container').append(template('preview-template', post));

            swiper = new Swiper($preview[0], {
                spaceBetween: 10,
            });

            addCard(entity.Theme.Layouts[0]);

            var $cardList = initCardList(post);
            var $layoutList = initLayoutList(entity.Theme);

            $panel.find('.join-footer-bar-list').on('click', function() {
                $preview.addClass('smaller');
                $cardList.addClass('in');
            });

            $panel.find('.join-footer-bar-add').on('click', function() {
                addCard(entity.Theme.Layouts[0]);
            });

            $panel.find('.join-footer-bar-layout').on('click', function() {
                $preview.addClass('smaller');
                $layoutList.addClass('in');
            });

        });
    }

    function addCard(layout) {
        var card = { layoutId: layout.id, Layout: layout, contents: [], pictures: [] };

        post.cards.push(card);

        swiper.appendSlide(template('card-template', card));
    }

    function initCardList(post) {
        var $cardList = $('.card-list').append(template('card-list-template', post));

        $cardList.find('.join-bar-close').on('click', function() {
            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        $cardList.find('.join-bar-save').on('click', function() {
            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        return $cardList;
    }

    function initLayoutList(theme) {
        var $layoutList = $('.layout-list').append(template('layout-list-template', theme));

        $layoutList.find('.join-bar-close').on('click', function() {
            $preview.removeClass('smaller');
            $layoutList.removeClass('in');
        });

        $layoutList.find('.join-bar-save').on('click', function() {
            $preview.removeClass('smaller');
            $layoutList.removeClass('in');
        });

        new Swiper($layoutList.find('.swiper-container')[0], {
            slideActiveClass: 'active',
            slidesPerView: 3,
            centeredSlides: true,
            paginationClickable: true,
            spaceBetween: 10
        });

        return $layoutList;
    }

});
