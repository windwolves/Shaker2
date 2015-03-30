define(['angular', 'angularResource'], function (angular) {
    'use strict';

    /* Services */

    var appServices = angular.module('appServices', ['ngResource']);

    appServices.factory('User', ['$resource',
        function($resource) {
            var User = $resource('/services/user/:id', {}, {
                update: { method: 'PUT' }
            });
            return User;
        }
    ]);

    appServices.factory('Activity', ['$resource',
        function($resource) {
            var Activity = $resource('/services/activity/:id', {}, {
                update: { method: 'PUT' },
                join: { method: 'POST', url: '/services/activity/join' }
            });
            return Activity;
        }
    ]);

    appServices.factory('GreetingCard', ['$resource',
        function($resource) {
            var GreetingCard = $resource('/services/greetingCard/:id', {}, {
                update: { method: 'PUT' }
            });
            return GreetingCard;
        }
    ]);

    appServices.factory('Template', ['$resource',
        function($resource) {
            var Template = $resource('/services/template/:id', {}, {
                update: { method: 'PUT' },
                getTemplateDemo: { method: 'GET', url: '/services/template/demo/:id/:type' }
            });
            return Template;
        }
    ]);

    appServices.factory('Tag', ['$resource',
        function($resource) {
            var Tag = $resource('/services/tag/:id', {});
            return Tag;
        }
    ]);

    appServices.factory('Map', ['$http',
        function($http) {
            var Map = {
                isLoaded: false,
                load: function(loadCallback) {
                    var self = this;

                    if(typeof loadCallback !== 'function') return;
                    this.loadCallback = loadCallback;

                    if(this.isLoaded) {
                        this.loadCallback();
                    }
                    else {
                        window.mapLoadCallback = function() {
                            delete window.mapLoadCallback;

                            self.isLoaded = true;
                            self.loadCallback();
                        };
                        $http.jsonp(requirejs.toUrl('bmap') + '&callback=mapLoadCallback');
                    }
                },
                loadCallback: function() {
                    console.log('Map load success!');
                }
            };

            return Map;
        }
    ]);

    return appServices;
});
