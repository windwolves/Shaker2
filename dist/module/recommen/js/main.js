function antireality(i){var a=$(".topic"),t=$('<div class="topics antireality" />').appendTo(a);i.forEach(function(i){{var a=$('<div class="topic_list" style="background:url('+i.thumbnail+') no-repeat 50%;background-size:100% 100%;" />').appendTo(t);$('<a class="topic_link" href="/entity/'+i.id+'"/>').appendTo(a)}})}function surreal(i){var a=$(".topic"),t=$('<div class="topics surreal" />').appendTo(a);i.forEach(function(i){{var a=$('<div class="topic_list" style="background:url('+i.thumbnail+') no-repeat 50%;background-size:100% 100%;" />').appendTo(t);$('<a class="topic_link" href="/entity/'+i.id+'"/>').appendTo(a)}})}$(function(){window.wechat.share({imgUrl:location.origin+"/module/recommen/img/icon.jpg",title:"稀客",description:"一个\n未知的\n内容互动社区"}),$.getJSON("/services/entity/type/anti-realism",function(i){"success"==i.status?antireality(i.data):console.error(i.data)}),$.getJSON("/services/entity/type/surrealism",function(i){"success"==i.status?surreal(i.data):console.error(i.data)}),$(".topics_antireality").hasClass("topics_active")?($(".antireality").show(),$(".surreal").hide()):$(".topics_surreal").hasClass("topics_active")&&($(".surreal").show(),$(".antireality").hide()),$(".topics_antireality").click(function(){$(".topics_antireality").addClass("topics_active"),$(".topics_surreal").removeClass("topics_active"),$(".antireality").show(),$(".surreal").hide()}),$(".topics_surreal").click(function(){$(".topics_surreal").addClass("topics_active"),$(".topics_antireality").removeClass("topics_active"),$(".surreal").show(),$(".antireality").hide()})});