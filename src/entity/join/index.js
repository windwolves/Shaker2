jQuery = $;

$(function() {
    'use strict';

    var userQueryString;

    var $panel, $preview, $cardList, $layoutList;

    var swiper;

    var post = { cards: [], deletedCards: [] };

    var maxFileSize = 1; // 1M

    var defaultPictrue = '/entity/join/img/picture-placeholder.jpg';

    // 设置用户信息
    window.wechat.auth(function(user) {
        userQueryString = '?' + $.param({ _username: user.username, _password: user.password });

        var id = location.pathname.split('/').slice(1)[1];

        $.getJSON('/services/entity/' + id, function(result) {
            if(result.status == 'success') {
                var entity = result.data;

                if(entity.status != 'accept') {
                    console.error('ENTITY_IS_PENDING');
                    return;
                }

                $.getJSON('/services/theme/' + entity.themeId, function(result) {
                    if(result.status != 'success') return;

                    entity.Theme = result.data; // 覆盖原Theme, 需要Layouts

                    initEntity(entity);
                });
            }
            else {
                console.error(result.data);
            }
        });
    });

    // 加载主题模板内容，初始化页面
    function initEntity(entity) {
        post.entity = entity;

        window.wechat.share({
            link: location.origin + '/entity/' + entity.id,
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
        var maxCardsLength = 10;

        $footer.find('.join-footer-bar-list').on('click', function() {
            updateCardList();

            $preview.addClass('smaller');
            $cardList.addClass('in');
        });

        $footer.find('.join-footer-bar-add').on('click', function() {
            if(post.cards.length < maxCardsLength) {
                addCard();
            }

            if(post.cards.length >= maxCardsLength) {
                $(this).addClass('disabled');
            }
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
                    alert('请先填写文字再发布！');
                    return false;
                }

                return true;
            });

            if(!isValid) return;

            if(!confirm('确认发布？！')) return;

            $(this).addClass('disabled');

            var data = { entityId: post.entity.id, cards: cards };

            $.post('/services/post' + userQueryString, data, function(result) {
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
        $preview = $('.preview-container').html(template('preview-template', post));

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

        var elStyle = $container.css({ height: newHeight })[0].style;
        elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = 'scale(' + scale + ')';

        $cardList.find('.join-bar-close').on('click', function() {
            if(post.deletedCards.length) {
                var i, n;
                var cards = post.cards.slice(0);

                for(i = post.deletedCards.length - 1; i >= 0; i--) {
                    cards.splice(post.deletedCards[i][0], 0, post.deletedCards[i][1]);
                }

                post.deletedCards = [];
                post.cards = [];
                swiper.removeAllSlides();

                for(i = 0, n = cards.length; i < n; i++) {
                    addCard(cards[i]);
                }
            }

            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        $cardList.find('.join-bar-save').on('click', function() {
            post.deletedCards = [];

            $preview.removeClass('smaller');
            $cardList.removeClass('in');
        });

        $cardList.on('click', '.join-bar-remove', function() {
            var index = $(this).parent().index();

            post.deletedCards.push([index, post.cards[index]]);
            post.cards.splice(index, 1);

            swiper.removeSlide(index);

            updateCardList();
        });
    }

    // 更新卡片缩略图列表
    function updateCardList() {
        var $container = $('.card-list .swiper-container').html(template('card-list-template', post));

        if($container[0].swiper) {
            $container[0].swiper.destroy();
        }

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

            var card = post.cards[swiper.activeIndex];

            if(card.layout_origin) {
                card.Layout = card.layout_origin;
                card.layoutId = card.Layout.id;

                card.layout_origin = null;

                updateCard(card);
            }
        });

        $layoutList.find('.join-bar-save').on('click', function() {
            $preview.removeClass('smaller');
            $layoutList.removeClass('in');

            post.cards[swiper.activeIndex].layout_origin = null;
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

        if($container[0].swiper) {
            $container[0].swiper.destroy();
        }

        new Swiper($container[0], {
            slideActiveClass: 'active',
            initialSlide: i,
            slidesPerView: 3,
            centeredSlides: true,
            slideToClickedSlide: true,
            onSlideChangeStart: function(swiper) {
                var index = swiper.activeIndex;
                var layout = theme.Layouts[index];

                card.layout_origin = card.Layout;

                card.Layout = layout;
                card.layoutId = card.Layout.id;

                updateCard(card);
            }
        });
    }

    // 添加卡片
    function addCard(card) {
        if(!card) {
            var layout = post.entity.Theme.Layouts[2];
            card = { layoutId: layout.id, Layout: layout, contents: [], pictures: [defaultPictrue] };
        }

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
            if(card.pictures[index] == defaultPictrue) {
                $(this).addClass('picture-default');
            }

            initUpload(this, card, index);
        });

        $slide.find('.content').each(function(i) {
            var $this = $(this).html('');

            var $textarea = $('<textarea rows="2" class="input-content"/>').attr('placeholder', '输入内容').appendTo($this);
            var $clone = $textarea.clone().addClass('input-content-clone').height(0).appendTo($this);

            var minHeight = $textarea.height();
            var maxHeight = Math.ceil(parseFloat($this.css('line-height')) * $this.attr('data-row'));

            var val;
            var scrollTop;

            $textarea.val(card.contents[i] || '');

            limitText();

            card.contents[i] = $textarea.val();


            function limitText() {
                val = $textarea.val();

                scrollTop = $clone.val(val).scrollTop(10000).scrollTop();
                scrollTop = Math.max(scrollTop, minHeight);

                while(scrollTop > maxHeight) {
                    val = val.slice(0, -1);
                    scrollTop = $clone.val(val).scrollTop(10000).scrollTop();
                }

                $textarea.val(val).css({ height: scrollTop });
            }

            $textarea.val(val).css({ height: scrollTop }).on('blur', function() {
                card.contents[i] = $textarea.val();
            }).on('paste', function() {
                setTimeout(limitText, 0);
            }).on('keyup', limitText);
        });
    }

    // 上传图片设置
    function initUpload(element, card, index) {
        var $element = $(element);

        var flow = new Flow({
            target: '/upload' + userQueryString,
            chunkSize: maxFileSize * 1024 * 1024,
            testChunks: false
        });

        flow.assignBrowse(element, false, true, { accept: 'image/*' });

        flow.on('fileAdded', function(file) {
            $element.addClass('uploading').append('<div class="upload-mask"><p class="upload-tip">图片上传中...</p></div>');
            $('.join-footer-bar-publish').addClass('disabled');
        });

        flow.on('filesSubmitted', function(file) {
            flow.upload();
        });

        flow.on('complete', function(file) {
            $element.removeClass('uploading').find('.upload-mask').remove();
            $('.join-footer-bar-publish').removeClass('disabled');
        });

        flow.on('fileSuccess', function(file, message) {
            var result;

            try {
                result = JSON.parse(message);
            }
            catch(ex) {
                console.error(message);
            }

            if(result.status == 'success') {
                var src = result.data[0].replace(/\\/g, '/');

                resizePicture({
                    src: src,
                    width: $element.width(),
                    height: $element.height()
                }, function(src) {
                    card.pictures[index] = src.replace(/\\/g, '/');
                    updateCard(card);
                });
            }
            else if(result.status == 'warning' && result.data == 'FILE_SIZE_TOO_LARGE') {
                alert('上传文件大小不得大于' + maxFileSize + 'M！');
            }
            else {
                console.log(result);
            }
        });
    }

    function resizePicture(picture, callback) {
        var $modal = $(template('picture-resize-template', picture)).appendTo($panel);

        var $img = $modal.find('img').cropper({
            aspectRatio: picture.width / picture.height,
            autoCropArea: 0.75,
            resizable: false,
            movable: false,
            dragCrop: false
        });

        $modal.find('.btn-save').on('click', function() {
            var canvas = $img.cropper('getCroppedCanvas', picture);
            var blob = canvasToBlob(canvas, 'image/jpeg', 0.8);
            var filename = picture.src.split('/').pop().split('.')[0] + '.jpg';

            var data = new FormData();
            data.append('file', blob, filename);
            data.append('origin_file', picture.src);

            $.ajax({
                type: 'post',
                url: '/upload' + userQueryString,
                data: data,
                contentType: false,
                processData: false,
                success: function(result) {
                    if(result.status == 'success') {
                        $img.cropper('destroy');
                        $modal.remove();

                        callback(result.data[0]);
                    }
                    else if(result.status == 'warning' && result.data == 'FILE_SIZE_TOO_LARGE') {
                        alert('上传文件大小不得大于' + maxFileSize + 'M！');
                    }
                    else {
                        console.log(result);
                    }
                }
            });
        });

        $modal.find('.btn-cancel').on('click', function() {
            $modal.remove();
        });
    }

    function canvasToBlob(canvas, type, quality) {
        var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }

        return new Blob([arr], { type: type || 'image/png' });
    }

});
