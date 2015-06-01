angular.module('commonServices', ['ngResource'])

.factory('Alertify', function () {
    var Alertify;

    if(typeof alertify !== 'undefined') {
        Alertify = {
            log: alertify.success,
            warn: function (msg) {
                alertify.log(msg, 'warning');
            },
            error: alertify.error
        };
    }
    else {
        Alertify = console;
    }

    return Alertify;
})

.factory('BaseService', function ($q, $resource, Alertify) {
    var BaseService = function (url, paramsDefaults, actions) {
        var self = this;
        var resource = $resource(url, paramsDefaults, actions);

        angular.forEach(Object.keys(resource), function (key) {
            self[key] = function(params) {
                var deffered = $q.defer();

                resource[key].call(resource, params, function(result) {
                    if(result.status == 'success') {
                        deffered.resolve(result.data);
                    }
                    else if(result.status == 'warning') {
                        Alertify.warn(result.data);
                    }
                    else if(result.status == 'error') {
                        deffered.reject(result.data);
                    }
                }, function (err) {
                    $q.reject(err);
                });

                return deffered.promise;
            };
        });

        return this;
    };

    return BaseService;
})

.factory('User', function(BaseService) {
    var User = new BaseService('/services/user/:id', { id: '@id' }, {
        login: { method: 'POST', url: '/services/user/login' },
        logout: { method: 'GET', url: '/services/user/logout' }
    });

    return User;
})


.factory('Entity', function(BaseService) {
    var Entity = new BaseService('/services/entity/:id', { id: '@id' }, {
        update: { method: 'PUT' }
    });

    return Entity;
});
