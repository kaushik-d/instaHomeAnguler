var app = angular.module('instahome', ['ui.router','easypiechart','ui.bootstrap','ngAutocomplete']);

app.factory('posts', ['$http', 'auth', function ($http, auth) {

    var o = {
        posts: []
    };

    o.create = function (post) {
        return $http.post('/posts', post, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            o.posts.push(data);
        });
    };
    
    o.updatePost = function (post) {
        return $http.post('/updatepost', post, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            //o.posts.push(data);
            //angular.copy(data, o.posts);
        });
    };

    o.delete = function (post) {
        return $http.delete('/post/' + post._id, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
           angular.copy(data, o.posts);
        });
    };

    o.get = function (id) {
        return $http.get('/post/' + id, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).then(function (res) {
            return res.data;
        });
    };

    o.getByAuthor = function () {
        return $http.get('/postsbyauthor', {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).then(function (res) {
            //angular.copy(data, o.posts);
            return res.data;
        });
    };

    return o;
}]);
/*
app.factory('weather', ['$http', 'auth', function ($http, auth) {

    var w = {
        forecast: []
    };

    w.get = function (zip) {
        return $http.get('/getweather/' + zip, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).then(function (res) {
            angular.copy(res.data.forecast.simpleforecast.forecastday, w.forecast);
        });
    };

    return w;
}]);
*/
app.factory('auth', ['$http', '$window', function ($http, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['instahome-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['instahome-token'];
    };

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('instahome-token');
    };

    return auth;
}]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
    'auth',
    //'weather',
//	function ($scope, posts, auth, weather) {
	function ($scope, posts, auth) {
        
        //weather.get('02920');
        //$scope.weather = weather.forecast;
        $scope.autocomplete = "";
        $scope.addressDetails = ""
        
        posts.getByAuthor().then(function(post) {
            $scope.posts = post;
        });
        $scope.posts = posts.posts;
        //$scope.posts.getAll();
        $scope.isLoggedIn = auth.isLoggedIn;
        
        $scope.showAddPost = function() {
            if($scope.isLoggedIn() && $scope.posts.length == 0) {
                return true;
            }
            return false;
        };

        $scope.addPost = function () {
            if (!$scope.zip) {
                return;
            }

            posts.create({
                address: $scope.address,
                city: $scope.city,
                state: $scope.state,
                country: $scope.country,
                zip: $scope.zip
            });

            $scope.address = '';
            $scope.city = '';
            $scope.state = '';
            $scope.country = '';
            $scope.zip = '';
        };
        
        $scope.deletePost = function (post) {
            posts.delete(post);
        };
        
        
        $scope.$watch('addressDetails', function(newValue, oldValue, scope) {
            if(!angular.equals(newValue,oldValue)) {
                scope.zip = "";
                scope.country = "";
                scope.city = "";
                scope.state = "";
                scope.address = "";
                for(var i = 0; i < scope.addressDetails.address_components.length; i++) {
                    var type = scope.addressDetails.address_components[i].types[0];
                    if(type == "postal_code") {
                        scope.zip = scope.addressDetails.address_components[i].short_name;
                    } else if (type == "country") {
                        scope.country = scope.addressDetails.address_components[i].short_name;
                    } else if (type == "locality") {
                        scope.city = scope.addressDetails.address_components[i].short_name;
                    } else if (type == "administrative_area_level_1") {
                        scope.state = scope.addressDetails.address_components[i].short_name;
                    } else if (type == "route") {
                        scope.address = scope.addressDetails.address_components[i].short_name;
                    }
                }
            }
        },true);
        
        /*
        $scope.addressChange = function() {
            $scope.zip = "";
            $scope.country = "";
            $scope.city = "";
            $scope.state = "";
            $scope.address = "";
            for(var i = 0; i < $scope.addressDetails.address_components.length; i++) {
                var type = $scope.addressDetails.address_components[i].types[0];
                if(type == "postal_code") {
                    $scope.zip = $scope.addressDetails.address_components[i].short_name;
                } else if (type == "country") {
                    $scope.country = $scope.addressDetails.address_components[i].short_name;
                } else if (type == "locality") {
                    $scope.city = $scope.addressDetails.address_components[i].short_name;
                } else if (type == "administrative_area_level_1") {
                    $scope.state = $scope.addressDetails.address_components[i].short_name;
                } else if (type == "route") {
                    $scope.address = $scope.addressDetails.address_components[i].short_name;
                }
            }
        };
        */
	}
]);

app.controller('PostsCtrl', [
	'$scope',
	'$interval',
	'posts',
    'post',
    'auth',
    function ($scope, $interval, posts, post, auth) {

        $scope.post = post;
       // $scope.post = $stateParams.post;
        $scope.isLoggedIn = auth.isLoggedIn;
        
        $scope.timeRemaining = [];
        
        $scope.updatePost = function () {
            posts.updatePost( $scope.post);
        };
        
        $scope.addZone = function () {
            $scope.post.sprinklerZone.push({duration: '0', status: "AUTO"});
            posts.updatePost( $scope.post);
        };
        
        $scope.deleteZone = function (index) {
            $scope.post.sprinklerZone.splice(index,1);
            posts.updatePost( $scope.post);
        };

        $scope.isOn = function (index) {
            return $scope.post.sprinklerZone[index].status == "ON";
        };
        
        $scope.anyZoneRunning = function (index) {
            for(var i = 0; i < $scope.post.sprinklerZone.length; i++) {
                if( $scope.post.sprinklerZone[i].status == "ON" ) {
                    return true;
                }
            }
        };
        
        $scope.deletePost = function (post) {
            posts.delete(post);
        };
        
        $scope.handleStatusChange = function (index) {
            
            $scope.timeRemaining[index] = 0;
            var date = new Date();
            $scope.post.sprinklerZone[index].lastRunStartTime = date.toISOString();
            posts.updatePost( $scope.post);
        };
        
        $scope.percent = (function() {
            var Arr = [];
            for(var i = 0; i < $scope.post.sprinklerZone.length; i++) {
                Arr[i] = 0;
            }
            return Arr;
        } ());
        
        $scope.pieChartOptions = {
            animate:{
                duration:0,
                enabled:false
            }
        };
        
        /*
        $scope.options = {
            animate:{
                duration:0,
                enabled:false
            },
            barColor:'#2C3E50',
            scaleColor:false,
            lineWidth:20,
            lineCap:'circle'
        }; 
        */
        
        $scope.intervals = [];
        
        $scope.$watch('post.sprinklerZone', function(newsprinklerZone, oldsprinklerZone, scope) {
            
            //if(angular.equals(newsprinklerZone,oldsprinklerZone)) {
            //    return;
            //}
            
            for(var j = 0; j < scope.intervals.length; j++) {
                $interval.cancel(scope.intervals[j]);
            }
            scope.intervals.length = 0;
            
            for( var index = 0; index < scope.post.sprinklerZone.length; index++)
            {
                var currentStatus = scope.post.sprinklerZone[index].status;
            
                if(currentStatus == "ON") {
                
                    var lastRunStartTime = scope.post.sprinklerZone[index].lastRunStartTime;
                    var lastDate = new Date(lastRunStartTime);
                    var currentTime = new Date();
                    
                    var currentTms = currentTime.getTime();
                    var startTms = lastDate.getTime();
                    var durationCurr = scope.post.sprinklerZone[index].duration*60;
                    scope.percent[index] = 100*timer/durationCurr;
                    
                    var timer =parseInt(durationCurr,10) - (currentTms - startTms)/1000;
                    
                    scope.intervals[index] = $interval(function(index, timer, durationCurr) { return function () {
                        
                        var minutes = parseInt(timer / 60, 10);
                        var seconds = parseInt(timer % 60, 10);
    
                        minutes = (minutes < 10 && minutes >= 0) ? "0" + minutes : minutes;
                        seconds = (seconds < 10 && seconds >= 0) ? "0" + seconds : seconds;
                    
                        scope.timeRemaining[index] = minutes + ":" + seconds;
                        scope.percent[index] = 100*timer/durationCurr;
                        
                        console.log(index);
                        console.log(scope.timeRemaining[index]);
                        
                        if(--timer < -2) {
        	                posts.getByAuthor().then(function(post) {
                                scope.post = post[0];
                                //scope.$apply();
                            });
                            $interval.cancel(scope.intervals[index]);
                        }
                    }}(index, timer, durationCurr), 1000,1200,true);
                } else {
                    scope.percent[index] = 0;
                }
            }
        },true);
	}
]);

app.controller('ScheduleCtrl', [
	'$scope',
	'posts',
    'post',
    'auth',
	//function ($scope, posts, post, auth) {
    function ($scope, posts, post, auth) {

        $scope.post = post;
       
        $scope.selectedTimes = (function() {
            var now = new Date();
            var timeArr = [];
            var hr = 0;
            for(var i = 0; i < $scope.post.startTime.length; i++) {
                hr = $scope.post.startTime[i].dayTime == "AM" ? $scope.post.startTime[i].startHr : $scope.post.startTime[i].startHr + 12;
                timeArr[i] = new Date(now.getYear(), now.getMonth(), now.getDate(), 
                    hr, $scope.post.startTime[i].startMin,
                    0,0);
            }
            return timeArr;
        } ());
        
        $scope.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        $scope.isLoggedIn = auth.isLoggedIn;
        
        $scope.selectTime = function(index) {
            var hr = parseInt($scope.selectedTimes[index].getHours(),10);
            $scope.post.startTime[index].startHr =  hr > 12 ? hr - 12 : hr ;
            $scope.post.startTime[index].startMin = parseInt($scope.selectedTimes[index].getMinutes(),10);
            $scope.post.startTime[index].dayTime =  hr > 12 ? "PM" : "AM";
        };
        
        $scope.updatePost = function () {
            posts.updatePost( $scope.post);
        };
        
        $scope.updateDays = function (day) {
            var index = $scope.post.daysOn.indexOf(day);
            if ( index == -1) {
                $scope.post.daysOn.push(day);
            } else {
                $scope.post.daysOn.splice(index, 1);
            }
            posts.updatePost( $scope.post);
        };
        
        $scope.selectEveryDay = function (day) {
            var i, length = $scope.days.length;
            for(i = 0;i < length; i++) {
                if ($scope.post.daysOn.indexOf($scope.days[i]) == -1) {
                    $scope.post.daysOn.push($scope.days[i]);
                }
            }
            posts.updatePost( $scope.post);
        };

        $scope.clearAllDay = function (day) {
            $scope.post.daysOn.length = 0;
            posts.updatePost( $scope.post);
        };
        
        $scope.isDayOn = function (day) {
            
            if ($scope.post.daysOn.indexOf(day) == -1) {
                return false;
            }
            return true;
        };
        
        $scope.addTime = function () {
            $scope.post.startTime.push({startHr: '0', startMin: '0', dayTime: "AM"});
            posts.updatePost( $scope.post);
        };
        
        $scope.deleteTime = function (index) {
            $scope.post.startTime.splice(index,1);
            posts.updatePost( $scope.post);
        };
        
        $scope.deletePost = function (post) {
            posts.delete(post);
        };
        
	}
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function ($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
                //resolve: {
                //    postPromise: ['posts', function (posts) {
                //        return posts.getAll();
                //        }]
                //}
            })
            .state('post', {
                url: '/post/{id}',
                templateUrl: '/post.html',
                controller: 'PostsCtrl',
                //params : { post: null }
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            })
            .state('schedule', {
                url: '/schedule/{id}',
                templateUrl: '/schedule.html',
                controller: 'ScheduleCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            });

        $urlRouterProvider.otherwise('home');
    }
]);
