angular.module('App', ['commonServices'])

.controller('LoginCtrl', function ($scope, User) {

    $scope.user = null;

    $scope.login = function (user) {
        User.login(user).then(function (user) {
            location.href = '../admin';
        });
    };
});

