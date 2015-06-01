angular.module('App', ['commonServices'])

.controller('AdminCtrl', function ($scope, Alertify, Entity) {

    $scope.types = [
        {key: 'recommend', text: '顶部推荐'},
        {key: 'surrealism', text: '超现实'},
        {key: 'anti-realism', text: '反现实'},
        {key: 'realism', text: '无'},
    ];
    $scope.types_with_all = [{text: '全部'}].concat($scope.types);

    $scope.status = [
        {key: 'pending', text: '待审核'},
        {key: 'accept', text: '审核通过'},
        {key: 'reject', text: '审核不通过'},
    ];
    $scope.status_with_all = [{text: '全部'}].concat($scope.status);

    $scope.search = {limit: 10};

    $scope.columns = [
        {field: 'title', title: '标题'},
        {field: 'likeCount', title: '点赞数', width: 100},
        {field: 'type', title: '类型', width: 150},
        {field: 'status', title: '状态', width: 150},
        {field: 'isSelected', title: '是否精选', width: 100},
        {title: '发布人', width: 120},
        {field: 'postLimit', title: '参与人数', width: 80},
        {field: 'createdAt', title: '创建日期', width: 150},
        {title: '操作', width: 60},
    ];

    $scope.query = function (search) {
        Entity.get(search).then(function (result) {
            $scope.entitys = result;
        });
    };

    $scope.save = function (d) {
        Entity.update(d).then(function (result) {
            Alertify.log('保存成功！');
        });
    };

    $scope.more = function () {
        $scope.search.limit += 10;

        Entity.get($scope.search).then(function (result) {
            if (result.length === $scope.entitys.length) {
                Alertify.warn('没有更多了！');
            }
            else {
                $scope.entitys = result;
            }
        });
    };

    $scope.query();

});

