angular.module('App', ['commonServices'])

.controller('AdminCtrl', function ($scope, Alertify, Entity) {

    $scope.columns = [
        {field: 'title', title: '标题'},
        {field: 'pv', title: '浏览量', width: 100},
        {field: 'postLimit', title: '参与人数', width: 100},
        {field: 'likeCount', title: '点赞数', width: 100},
        {field: 'type', title: '类型', width: 150},
        {field: 'status', title: '状态', width: 150},
        {field: 'isSelected', title: '是否精选', width: 120},
        {title: '操作', width: 120},
    ];

    $scope.types = [
        {key: 'recommend', text: '顶部推荐'},
        {key: 'surrealism', text: '超现实'},
        {key: 'anti-realism', text: '反现实'},
        {key: 'realism', text: '无'},
    ];

    $scope.status = [
        {key: 'pending', text: '待审核'},
        {key: 'accept', text: '审核通过'},
        {key: 'reject', text: '审核不通过'},
    ];

    $scope.save = function (d) {
        Entity.update(d).then(function (result) {
            Alertify.log('保存成功！');
        });
    };

    Entity.get().then(function (result) {
        $scope.entitys = result;
    });

});

