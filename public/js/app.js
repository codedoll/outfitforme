var app = angular.module('OutfitForMe', ['ngRoute', 'angularMoment', 'ngRoute', 'ngSanitize']);

// app.run(function(amMoment) {
//     amMoment.changeLocale('de');
// });

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider.when('/', {
        templateUrl: 'partial/home.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    }).when('/ga', {
        templateUrl: 'google.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    })


}])




app.controller('MainController', ['$http', '$scope', '$routeParams', '$route', function($http, $scope, $routeParams, $route) {

    var self = this;



    moment.tz.add([
        'America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0',
        'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0'
    ]);

    // this.analytics = function() {
    //     // console.log('hi from analytics');
    //     $http({
    //         url: '/analytics',
    //         method: 'GET'
    //     }).then(function(response) {
    //         console.log(response.data);
    //     })
    // };

    // this.analytics();



    // this.analytics2 = function() {
    //     // console.log('hi from analytics');
    //     $http({
    //         url: '/analytics2',
    //         method: 'GET'
    //     }).then(function(tokens) {
    //         // console.log(tokens.data);
    //         $scope.token = tokens.data;
    //     })
    // };

    // this.analytics2();

    var currentIcon;
    this.forecast = function(userLocation) {
        // console.log(userLocation)
        $http({
            url: '/forecast/' + userLocation.zipcode,
            method: 'GET',
            // data: userLocation
        }).then(function(data) {

            self.darksky = data.data;
            
            self.sky = data.data.hourly.data

            var skycons = new Skycons({ "color": "orange" });

            var currentIcon = data.data.currently.icon.toUpperCase();
            
            var currentIcon2 = currentIcon.replace(/[_-]/g, "_");

            skycons.add("icon1", Skycons[currentIcon2]);

            skycons.play();

        })
    };


    $scope.data = {
    model: null,
    availableOptions: [
      {id: '1', name: 'Blouse'},
      {id: '2', name: 'Dress'},
      {id: '3', name: 'Skirt'}
    ],
   };



}]); // end MainController
