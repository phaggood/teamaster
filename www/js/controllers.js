angular.module('teamaster.controllers', [])

    .controller('SplashController',["$scope","$state","$cordovaNetwork", function($scope, $state, $cordovaNetwork) {

        // catch the appState from module.run()
        $scope.$on('appInit', function(event, args) {
            console.log("appstate " + args.appState);
            if (args.appState==true) {
                $scope.initFail = false;
                $state.go('login');
            } else {
                $scope.initFail = true;  // splashscreen displays init fail msg
            }
        });

        // determine online status
        var init = function(){
            //var type = $cordovaNetwork.getNetwork();
            var isOnline = $cordovaNetwork.isOnline();
            if (isOnline == false) {
                // set offline mode
                alert("Offline");
            }

        };

        // controller init on instantiation
        //init();

    }])

    .controller('LogoutCtrl', function($scope, AuthService, $state ) {

        $scope.logout = function(){
            AuthService.logout();
            $state.go('login');
        };

        $scope.cancelLogout = function() {
            $state.go('tab.daychart',{chartType:"DAY"});;
        }
    })

    .controller('TeaListCtrl', function($scope, TeaService, $state ) {

        $scope.teas =  [];
        $scope.errMsg = "";

        var init = function() {
            TeaService.teas().then(
                function (result) {
                    $scope.teas = result.record;
                    $scope.errMsg = "";
                },
                function (reject) {
                    $scope.teas = {};
                    $scope.errMsg = "unable to access teas";
                }
            )
        };

        init();
    })

    .controller('TeaAddCtrl', function($scope, AuthService, TeaService, $state, $stateParams ) {
        $scope.tea = {};
        var init = function() {
            // if id != null this is an update not an add
            if (!($stateParams.id === undefined)) {
                var id = $stateParams.id;
                TeaService.tea(id).then(
                    function (result) {
                        $scope.tea = result;
                        $scope.errMsg = "";
                    },
                    function (reject) {
                        $scope.tea = [];
                        $scope.errMsg = "unable to access tea";
                    }
                );
            }
        };

        $scope.saveTea = function() {
            $scope.tea.userid = AuthService.getActiveUser().userid;
            TeaService.addTea($scope.tea).then(
                // Success function
                function(result) {
                    $state.go('tab.teas');
                },

                // Error function
                function(reject) {
                    console.log("failed saving tea");
                }
            )
        };

        $scope.cancelSave = function() {
            $state.go('tab.teas');
        }

        init();
    })

    .controller('TeaDetailCtrl', function($scope, AuthService, TeaService, $state, $stateParams ) {
        var id = $stateParams.id;

        $scope.brewTimeRemaining = "";
        $scope.tea = {};


        var init = function() {
            TeaService.tea(id).then(
                function(result) {
                    $scope.tea = result;
                    $scope.errMsg = "";
                },
                function(reject) {
                    $scope.tea = [];
                    $scope.errMsg = "unable to access tea";
                }
            );
        };
        init();
    })

    // Right now this uses a dom method to find the audio control and play the sound; this isn't very
    // 'Angular' and will be changed as soon as I figure out directives
    // http://jsfiddle.net/aarongloege/K8J26/light/
    .controller("BrewCtrl", function($scope,$timeout, $stateParams,BrewService,TeaService,$cordovaVibration,$cordovaDialogs){
        var id = $stateParams.id;
        var mytimeout = null;
        var counter = 0;

        $scope.brewTimeDisplay = "00:00";

        var vibrate = function() {
                // Vibrate 1/2 sec
                $cordovaVibration.vibrate(500);
        }


        var playSound = function(str) {
            //audio = document.getElementById(str);
            //audio.play();
            $cordovaDialogs.beep(2);
            vibrate();
        }

        var cancelBrew = function(){
            $timeout.cancel(mytimeout);
            $scope.brewComplete = false;
             $scope.brewCancel = true;
             $scope.brewing = false;
             $scope.brewReady = false;
            $scope.brewTimeDisplay = "Brewing cancelled";
            playSound("cancel");
        }

        var startBrew = function(){
            $scope.brewComplete = false;
            $scope.brewCancel = false;
            $scope.brewing = true;
            $scope.brewReady = false;
            counter = $scope.tea.brewMinutes*60 * 1000;
            mytimeout = $timeout($scope.onTimeout,1000);
            $scope.brewTimeDisplay = "Brewing";
        }

        var completeBrew = function(){
            $scope.brewComplete = true;
            $scope.brewCancel = false;
            $scope.brewing = false;
            $scope.brewReady = false;
            playSound("done");
            $scope.brewTimeDisplay = "Brewing complete";
        }

        var readyBrew = function(msg){
            $scope.brewComplete = false;
            $scope.brewCancel = false;
            $scope.brewing = false;
            $scope.brewReady = true;
            $scope.brewTimeDisplay = msg;
        }

        var init = function() {
            TeaService.tea(id).then(
                function(result) {
                    $scope.tea = result;
                    readyBrew("Ready: " + BrewService.msToTime($scope.tea.brewMinutes*60 * 1000));
                },
                function(reject) {
                    $scope.tea = [];
                    $scope.brewTimeDisplay = "unable to access tea";
                }
            );
        };

        $scope.onTimeout = function(){
            counter-=1000;
            if (counter >=0) {
                mytimeout = $timeout($scope.onTimeout, 1000);
                $scope.brewTimeDisplay = BrewService.msToTime(counter);
            } else {
                $timeout.cancel(mytimeout);
                completeBrew();
            }
        };


        $scope.startBrew = function(){
            startBrew();
        };

        $scope.cancelBrew = function() {
            cancelBrew();
        };

        init();


    })

    .controller('AuthCtrl', function($scope, AuthService, $state, $http ){

        $scope.rememberMe = false;
        $scope.loginErrorMessage = "";

        // model for login credentials
        $scope.creds = {
            email: '',
            password: ''
        };

        var createSession = function(creds) {
            AuthService.login(creds).then(
                function(result) {
                    console.log("logged in " + creds.email);
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.session_id;
                    AuthService.initActiveUser(result);
                    if ($scope.rememberMe==true) {
                        //AuthService.rememberMe();
                    } else {
                        //AuthService.forgetMe();
                    }
                    $state.go('tab.teas');
                },
                function(reject) {
                    AuthService.clearActiveUser();
                    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = ""
                    $scope.loginErrorMessage = "bad login";
                }
            )
        }

        $scope.login = function(){
            createSession($scope.creds);
        };

        // this is probably not the best way to set this up, but it works.
        $scope.guestLogin = function(){
            var creds = {email:"tm_guest@spieleware.com", password:"guest"}
            createSession(creds);
        };

        $scope.logout = function(){
            $scope.activeUser = AuthService.logout();
            AuthService.clearActiveUser();
            $rootScope.$broadcast('user:logout');
        }
    });
