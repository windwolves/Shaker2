$(function(){"use strict";function e(e){function t(){var t=$(".hot-list"),n=t.height(),i=$(".panel").height(),o=n/i;t.css({height:i,transform:"scale("+o+")"}),t.html(template("hot-list-template",{entitys:e})),t.find(".hot-item").each(function(t){var n=e[t];$(this).html(template("theme-template-"+n.Theme.code,n))});new Swiper(".swiper-container",{direction:"horizontal",slidesPerView:"auto",spaceBetween:100,mousewheelControl:!0,freeMode:!0,preloadImages:!1,lazyLoading:!0,lazyLoadingInPrevNext:!0,lazyLoadingOnTransitionStart:!0})}var o=location.origin+"/entity/"+n+"?pid="+i;"undefined"!=typeof wechat&&wechat.share({link:o,imgUrl:(location.origin+entity.picture).replace(/.*http/g,"http"),title:entity.title,description:entity.content}),$(".back").on("click",function(){location.href=o});var a=[];e.forEach(function(e){-1==a.indexOf(e.Theme.code)&&a.push(e.Theme.code)});var c=a.length,l=[];a.forEach(function(e){$('<link rel="stylesheet"/>').attr("href","/page/"+e+"/css/style.css").appendTo("head"),$.get("/page/"+e+"/index.html",function(n){$('<script id="theme-template-'+e+'" type="text/html"/>').html(n).appendTo($("body")),l[e]=n,--c||t()})})}var t=location.pathname.split("/").slice(1),n=t[1],i=t[3];$.getJSON("/services/entity/hot",function(t){"success"==t.status?e(t.data):console.error(t.data)}),$(window).on("scroll",function(e){e.preventDefault()}).on("touchmove",function(e){e.preventDefault()}).on("mousemove","img",function(e){e.preventDefault()})});