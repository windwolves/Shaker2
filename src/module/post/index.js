angular.module('App', ['commonServices'])

.controller('AdminCtrl', function ($scope, Alertify, Post) {

    $scope.status = [
        {key: 'pending', text: '待审核'},
        {key: 'accept', text: '审核通过'},
        {key: 'reject', text: '审核不通过'},
    ];
    $scope.status_with_all = [{text: '全部'}].concat($scope.status);

    $scope.search = {limit: 10};

    $scope.columns = [
//        {field: 'title', title: '标题'},
        {field: 'id', title: 'ID', width: 100},
        {field: 'likeCount', title: '点赞数', width: 100},
//        {field: 'type', title: '类型', width: 150},
        {field: 'status', title: '状态', width: 150},
//        {field: 'isSelected', title: '是否精选', width: 100},
        {title: '发布人', width: 120},
//        {field: 'postLimit', title: '参与人数', width: 80},
        {field: 'createdAt', title: '创建日期', width: 150},
        {title: '操作', width: 60},
    ];

    $scope.query = function (search) {
        Post.get(search).then(function (result) {
            $scope.posts = result;
        });
    };

    $scope.save = function (d) {
        Post.update(d).then(function (result) {
            Alertify.log('保存成功！');
        });
    };

    $scope.more = function () {
        $scope.search.limit += 10;

        Post.get($scope.search).then(function (result) {
            if (result.length === $scope.posts.length) {
                Alertify.warn('没有更多了！');
            }
            else {
                $scope.posts = result;
            }
        });
    };

    $scope.query();

});

