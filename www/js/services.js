angular.module('teamaster.services', [])

    .factory('BrewService', function() {

        var startTime = null;
        var timeRemaining = 0;
        var timeStr = "";

        var setTimeStr = function(rem) {
            timeStr = parseInt(rem / 1000 / 60) + ":" + (rem / 1000 % 60)
        };

        return {

            msToTime : function(duration) {
                var milliseconds = parseInt((duration%1000)/100)
                    , seconds = parseInt((duration/1000)%60)
                    , minutes = parseInt((duration/(1000*60))%60)
                    , hours = parseInt((duration/(1000*60*60))%24);

                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;

                return  minutes + ":" + seconds;
            }
        }
    })

    .factory('TeaService', ['$q', 'DreamFactory','AuthService', function($q, DreamFactory,AuthService) {

        var guest_mode = false;

        return {

            guestMode: function(val) {
                guest_mode = val;
            },

            isGuestMode: function() {
                return  guest_mode;
            },

            teas: function() {
                var deferred = $q.defer();

                var request = {
                    table_name: "tsteas"
                    //,filter: "ownerid = " + AuthService.getActiveUser().userId   // this should be serverside
                };
                DreamFactory.api.db.getRecords(request,
                    function(data) {
                        deferred.resolve(data);
                    },
                    function(error){
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            },

            tea: function(id) {
                var deferred = $q.defer();
                var request = {
                    table_name: "tsteas",
                    id: id
                };
                DreamFactory.api.db.getRecord(request,
                    function(data) {
                        deferred.resolve(data);
                    },
                    function(error){
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            },

            addTea: function(tea){
                var deferred = $q.defer();
                var request = {
                    table_name: "tsteas",
                    body: tea
                };

                DreamFactory.api.db.createRecords(request,

                    // Success function
                    function(data) {
                        deferred.resolve(data);
                    },

                    // Error function
                    function(error) {
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            }
        }
    }])



    .factory('AuthService', ["DreamFactory","$http","$q", function(DreamFactory, $http, $q) {

        var activeUser = {
            sessionId : "",
            userId : -1,
            name : ""
        };

        var resetActiveUser = function() {
            activeUser.sessionId = "";
            activeUser.userId = -1;
            activeUser.name = "";
        };

        return {

            initActiveUser :  function(usr) {
                console.log("init " + usr.session_id);
                activeUser.sessionId = usr.session_id;
                activeUser.userId = usr.id;
                activeUser.name = usr.display_name;
            },

            clearActiveUser: function() {
                resetActiveUser();

            },

            getActiveUser : function() {
                return activeUser;
            },

            // Define custom getRecords service
            login: function(creds) {
                //console.log("Connecting " + creds.email + " , " + creds.password);
                // create a promise
                var deferred = $q.defer();

                // Call DreamFactory database service with credentials
                //DreamFactory.api.user.login({"body":{"email":creds.email, "password":creds.password}},
                DreamFactory.api.user.login({"body":creds},

                    // Success function
                    function(data) {
                        deferred.resolve(data);
                    },
                    function(error){
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            },

            logout: function() {
                resetActiveUser();
                DreamFactory.api.user.logout();
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = "";
            }
        }
    }]);
