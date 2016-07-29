var app = angular.module('OutfitForMe', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider

    // .when('/', {
    //     templateUrl: 'partial/home_page.html',
    //     controller: 'MangaController',
    //     controllerAs: 'mctrl'
    // })

    // .when('/admin', {  
    //     templateUrl: '/admin.html',  
    //     controller: 'AdminController',
    //     controllerAs: 'actrl'
    // })  
}])

// console.log('app.js loaded');
app.controller('MainController', ['$http', '$route', function($http, $route) {
    // var self = this;
    // var usernameLogged = "GUEST";
    // this.sayHello = function() {
    //     alert("saHello()")
    // }

    // //registration popup
    // this.registerModal = function() {
    //         // $scope.manga = manga;

    //         ngDialog.open({
    //             template: '/partial/user_register_partial.html',
    //             // className: 'ngdialog-theme-plain',
    //             // controller: 'MangaController',
    //             scope: $scope
    //         });
    //     }
    //     //


    // // login function
    // // the function for submit button on login form gets the user data from DB
    // this.loginForm = function(loginform) {
    //     $http({
    //         url: '/user/login',
    //          method: 'POST',
    //          data: loginform
    //     }).then(function(response) {
    //         console.log(response.data);
    //         if (response.data.user != "INVALID") {
    //             self.usernameLogged = response.data.sessionID;
    //             //flip partials to the user menu partials
    //         }

    //         $route.reload();

    //     })
    // };


    this.analytics = function() {
        console.log('hi from analytics');
        $http({
            url: '/analytics',
            method: 'GET'
        }).then(function(response) {
            console.log(response.data);
        })
    };

    this.analytics();


        this.analytics2 = function() {
        console.log('hi from analytics');
        $http({
            url: '/analytics2',
            method: 'GET'
        }).then(function(tokens) {
            console.log(tokens.data);
        })
    };

    this.analytics2();


    // var report = new gapi.analytics.report.Data({
    //     query: {
    //         ids: 'ga:XXXX',
    //         metrics: 'ga:sessions',
    //         dimensions: 'ga:city'
    //     }
    // });

    // report.on('success', function(response) {
    //     console.log(response);
    // });

    // report.execute();


}]); // end MainController
