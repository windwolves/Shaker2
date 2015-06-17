$(function(){
    if($('.topics_antireality').hasClass('topics_active')){
        $.getJSON('/services/entity/type/anti-realism', function(result) {
            if(result.status == 'success') {
                antireality(result.data);
            }
            else {
                console.error(result.data);
            }
        });
    }else if($('.topics_surreal').hasClass('topics_active')){
        $.getJSON('/services/entity/type/surrealism', function(result) {
            if(result.status == 'success') {
                surreal(result.data);
            }
            else {
                console.error(result.data);
            }
        });
    }

    $(".topics_antireality").click(function(){
        $(".topics_antireality").addClass("topics_active");
        $(".topics_surreal").removeClass("topics_active");
        $.getJSON('/services/entity/type/anti-realism', function(result) {
            if(result.status == 'success') {
                antireality(result.data);
            }
            else {
                console.error(result.data);
            }
        });
        $(".antireality").show();
        $(".surreal").hide();
    });
    $(".topics_surreal").click(function(){
        $(".topics_surreal").addClass("topics_active");
        $(".topics_antireality").removeClass("topics_active");
        $.getJSON('/services/entity/type/surrealism', function(result) {
            if(result.status == 'success') {
                surreal(result.data);
            }
            else {
                console.error(result.data);
            }
        });
        $(".surreal").show();
        $(".antireality").hide();
    });

});

function antireality(entitys) {
    var $panel = $('.topic');

    var $entitys = $('<div class="topics antireality" />').appendTo($panel);

    entitys.forEach(function(entity) {
        var $div = $('<div class="topic_list" style="background:url('+entity.thumbnail+') no-repeat 50%;background-size:100%;" />').appendTo($entitys);
        var $link = $('<a class="topic_link" href="/entity/'+entity.id+'"/>').appendTo($div);
        var $title = $('<p class="topic_title" />').html(entity.title);

        $div.append($title);
    });
}

function surreal(entitys) {
    var $panel = $('.topic');

    var $entitys = $('<div class="topics surreal" />').appendTo($panel);

    entitys.forEach(function(entity) {
        var $div = $('<div class="topic_list" style="background:url('+entity.thumbnail+') no-repeat 50%;background-size:100%;" />').appendTo($entitys);
        var $link = $('<a class="topic_link" href="/entity/'+entity.id+'"/>').appendTo($div);
        var $title = $('<p class="topic_title" />').html(entity.title);

        $div.append($title);
    });
}