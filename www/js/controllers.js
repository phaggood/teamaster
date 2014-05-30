angular.module('teamaster.controllers', [])

    .controller('SplashController',["$scope","$state","DreamFactory","$timeout", function($scope, $state,DreamFactory,$timeout) {
        var tCount = 0;
        $scope.initFail = false;

        // Dreamfactory gets 5secs to return ready
        var init = function() {
            while (tCount < 4) {
                $timeout(function () {
                    if (DreamFactory.isReady()) {
                        // Make sure you see the splash screen for at least 2 secs
                        if (tCount > 2) {
                            $state.go('login');
                        }
                    }
                }, 1000);
                tCount++;
            }
            $scope.initFail = true;
        };

        init();

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

    .controller("BrewCtrl", function($scope,$timeout, $stateParams,BrewService,TeaService){
        var id = $stateParams.id;
        var mytimeout = null;
        var counter = 0;

        $scope.brewTimeDisplay = "00:00";
        $scope.brewing = false;

        var init = function() {
            TeaService.tea(id).then(
                function(result) {
                    $scope.tea = result;
                    $scope.brewTimeDisplay = BrewService.msToTime($scope.tea.brewMinutes*60 * 1000);
                    $scope.errMsg = "";
                },
                function(reject) {
                    $scope.tea = [];
                    $scope.errMsg = "unable to access tea";
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
                $scope.brewing = false;
                $scope.brewTimeDisplay = "Brewing complete";
            }
        } ;


        $scope.startBrew = function(){
            counter = $scope.tea.brewMinutes*60 * 1000;
            mytimeout = $timeout($scope.onTimeout,1000);
            $scope.brewing = true;
        };

        $scope.cancelBrew = function() {
            $timeout.cancel(mytimeout);
            $scope.brewTimeDisplay = "Brewing cancelled";
            $scope.brewing = false;
        };

        init();


    })

    .controller('AuthCtrl', function($scope, AuthService, $state, $http ){

        $scope.rememberMe = false;

        // model for login credentials
        $scope.creds = {
            email: '',
            password: ''
        };

        $scope.login = function(){
            AuthService.login($scope.creds).then(
                function(result) {
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
                }
            )
        };

        $scope.logout = function(){
            $scope.activeUser = AuthService.logout();
            AuthService.clearActiveUser();
            $rootScope.$broadcast('user:logout');
        }
    });
