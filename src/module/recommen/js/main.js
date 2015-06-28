$(function(){
    // 微信分享
    window.wechat.share({
        imgUrl: location.origin + '/module/recommen/img/icon.jpg',
        title: '稀客',
        description: '一个\n未知的\n内容互动社区'
    });

    $.getJSON('/services/entity/type/anti-realism', function(result) {
        if(result.status == 'success') {
            antireality(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    $.getJSON('/services/entity/type/surrealism', function(result) {
        if(result.status == 'success') {
            surreal(result.data);
        }
        else {
            console.error(result.data);
        }
    });

    if($('.topics_antireality').hasClass('topics_active')){
        $(".antireality").show();
        $(".surreal").hide();
    }else if($('.topics_surreal').hasClass('topics_active')){
        $(".surreal").show();
        $(".antireality").hide();
    }

    $(".topics_antireality").click(function(){
        $(".topics_antireality").addClass("topics_active");
        $(".topics_surreal").removeClass("topics_active");

        $(".antireality").show();
        $(".surreal").hide();
    });
    $(".topics_surreal").click(function(){
        $(".topics_surreal").addClass("topics_active");
        $(".topics_antireality").removeClass("topics_active");
        $(".surreal").show();
        $(".antireality").hide();
    });

});

function antireality(entitys) {
    var $panel = $('.topic');

    var $entitys = $('<div class="topics antireality" />').appendTo($panel);

    entitys.forEach(function(entity) {
        var $div = $('<div class="topic_list" style="background:url('+entity.thumbnail+') no-repeat 50%;background-size:100% 100%;" />').appendTo($entitys);
        var $link = $('<a class="topic_link" href="/entity/'+entity.id+'"/>').appendTo($div);
        //var $title = $('<p class="topic_title" />').html(entity.title);

        //$div.append($title);
    });
}

function surreal(entitys) {
    var $panel = $('.topic');

    var $entitys = $('<div class="topics surreal" />').appendTo($panel);

    entitys.forEach(function(entity) {
        var $div = $('<div class="topic_list" style="background:url('+entity.thumbnail+') no-repeat 50%;background-size:100% 100%;" />').appendTo($entitys);
        var $link = $('<a class="topic_link" href="/entity/'+entity.id+'"/>').appendTo($div);
        //var $title = $('<p class="topic_title" />').html(entity.title);

        //$div.append($title);
    });
}