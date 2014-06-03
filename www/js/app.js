// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('teamaster', ['ionic', 'timer','ngDreamFactory','teamaster.services', 'teamaster.controllers'])
    .constant('DSP_URL', 'http://ec2-23-22-183-175.compute-1.amazonaws.com/')
    .constant('DSP_API_KEY', 'teamasterapp')

    .run(function() {
        FastClick.attach(document.body);
    })

    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider

            // splash page
            .state('splash', {
                url: "/splash",
                templateUrl: "templates/splash.html",
                controller: 'SplashController'
            })

            // authenticate user to app
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'AuthCtrl'
            })

            .state('add', {
                url: '/add',
                templateUrl: 'templates/tea-add.html',
                controller: "TeaAddCtrl"
            })

            // de-authenticate user to app
            .state('logout', {
                url: "/logout",
                templateUrl: "templates/logout.html",
                controller: 'LogoutCtrl'
            })

            // tab pages is abstract base for child tab pages
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            .state('tab.teas', {
                url: '/teas',
                views: {
                    'teas-tab': {
                        templateUrl: 'templates/tea-list.html',
                        controller: "TeaListCtrl"
                    }
                }
            })


            .state('tab.tea', {
                url: '/tea/:id',
                views: {
                    'teas-tab': {
                        templateUrl: 'templates/tea-detail.html',
                        controller: "TeaDetailCtrl"
                    }
                }
            })


            .state('tab.brew', {
                url: '/brew/:id',
                views: {
                    'teas-tab': {
                        templateUrl: 'templates/brew.html',
                        controller: "BrewCtrl"
                    }
                }
            })

            .state('tab.about', {
                url: '/about',
                views: {
                    'about-tab': {
                        templateUrl: 'templates/about.html'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');

    });