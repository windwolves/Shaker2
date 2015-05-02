$(function() {
    'use strict';

    var urlParams = location.pathname.split('/').slice(1);
    var entityId = urlParams[1];
    var postId = urlParams[3];

    $.getJSON('/services/entity/hot', function(result) {
        if(result.status == 'success') {
            initHotEntitys(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    function initHotEntitys(entitys) {
        var backUrl = location.origin + '/entity/' + entityId + '?pid=' + postId;

        // 微信分享
        if(typeof wechat !== 'undefined') {
            wechat.share({
                link: backUrl,
                imgUrl: (location.origin + entity.picture).replace(/.*http/g, 'http'),
                title: entity.title,
                description: entity.content
            });
        }

        $('.back').on('click', function() {
            location.href = backUrl;
        });

        var themes = [];

        entitys.forEach(function(entity) {
            if(themes.indexOf(entity.Theme.code) == -1) {
                themes.push(entity.Theme.code);
            }
        });

        var len = themes.length;

        var themeTemplates = [];

        themes.forEach(function(theme) {
            $('<link rel="stylesheet"/>').attr('href', '/page/' + theme + '/css/style.css').appendTo('head');

            $.get('/page/' + theme + '/index.html', function(themeTemplate) {
                $('<script id="theme-template-' + theme + '" type="text/html"/>').html(themeTemplate).appendTo($('body'));

                themeTemplates[theme] = themeTemplate;
                --len || init();
            });
        });

        function init() {
            var $container = $('.hot-list');

            var oldHeight = $container.height();
            var newHeight = $('.panel').height();

            var scale = oldHeight / newHeight;

            var elStyle = $container.css({ height: newHeight })[0].style;
            elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = 'scale(' + scale + ')';

            $container.html(template('hot-list-template', { entitys: entitys }));

            $container.find('.hot-item').each(function(i) {
                var entity = entitys[i];

                $(this).html(template('theme-template-' + entity.Theme.code, entity));
            });

            var swiper = new Swiper('.swiper-container', {
                // scrollbar: '.swiper-scrollbar',
                direction: 'horizontal',
                slidesPerView: 'auto',
                spaceBetween: 100,
                mousewheelControl: true,
                freeMode: true,
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingOnTransitionStart: true
            });

        }

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
