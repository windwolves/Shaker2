$(function() {
    window.wechat.share({
        imgUrl: location.origin + '/module/question/img/icon.png',
        title: '一个和尚写给投资人的信',
        description: '不必要的谈判，不免浪费时间。若臭味相投，欢迎骚扰。必知无不言，言无不尽。',
    });

    $('#form').submit(function() {
        var name = $(this.username).val();
        var company = $(this.usercompany).val();
        var tel = $(this.usertel).val();
        var mail = $(this.usermail).val();
        var info = name + ",mail:" + mail
        $.ajax({
            url: "/services/temp/join",
            type: "post",
            data: {"name": info,"company":company,"telphone":tel},
            success: function(data){
                if(data.status == "success"){
                    alert("提交成功，请耐心等待！");
                    location.reload();
                }
            },
            error: function(request) {
                alert("提交失败，请稍后重试！");
                alert("request.status:"+request.status+",request.statusText:"+request.statusText+",request.responseText:"+request.responseText);
                location.reload();
            }
        });

        return false;
    })
});

function initWechat(options) {
    options || (options = {});

    var link = options.link || location.href.split('#')[0];

    $.post('/services/wechat/signature', {
        url: link
    }, function(result) {
        if (result.status == 'success') {
            wx.config({
                debug: !!location.search.slice(1).match(/debug=true/),
                appId: result.data.appId,
                nonceStr: result.data.nonceStr,
                timestamp: result.data.timestamp,
                signature: result.data.signature,
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo']
            });

            wx.ready(function() {
                wx.onMenuShareTimeline({
                    title: options.title,
                    link: link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });

                wx.onMenuShareAppMessage({
                    title: options.title,
                    desc: options.description,
                    link: link,
                    imgUrl: options.imgUrl,
                    success: function(err) {
                        console.log(err);
                    },
                    fail: function(err) {
                        console.log(err);
                    }
                });

                wx.onMenuShareQQ({
                    title: options.title,
                    desc: options.description,
                    link: link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });

                wx.onMenuShareWeibo({
                    title: options.title,
                    link: link,
                    imgUrl: options.imgUrl,
                    fail: function(err) {
                        console.log(err);
                    }
                });
            });

            wx.error(function(reason) {
                if (reason == 'invalid signature') {
                    $.get('/services/wechat/cleartoken');
                }
            });

        } else {
            console.error(result.data);
        }
    });
}
