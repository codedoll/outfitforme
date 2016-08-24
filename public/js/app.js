var app = angular.module('OutfitForMe', ['ngRoute', 'angularMoment', 'ngRoute', 'ui.select', 'ngSanitize', 'ngDialog']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider.when('/', {
        templateUrl: 'partial/home.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    })
    .when('/adminform', {
        templateUrl: 'partial/admin_form.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    })
    
}])


app.controller('MainController', ['$http', '$scope', '$routeParams', '$route', 'ngDialog', function($http, $scope, $routeParams, $route, ngDialog) {

    var self = this;

    var usernameLogged = "GUEST";

    self.sessionID = "GUEST";

    $scope.dataLoaded = true;


    //GET ALL CLOTHING VALUES IN DB
    $scope.adminLoad = function() {
        $scope.dataLoaded = false;

        $http({
            url: '/clothing',
            method: 'GET',
        }).then(function(clothingDbData) {
            $scope.dataLoaded = true;
            self.clothingDbData = clothingDbData.data;
        });
    };
    //END adminLoad function


    //DELETE CLOTHING
    this.deleteClothing = function(clothing) {
        $http({
            method: 'DELETE',
            url: '/clothingDelete',
            data: {
                clothing: clothing
            },
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })

        $route.reload();
    }
    //END deleteClothing function


    //CHECKS IF USER IS LOGGED IN
    this.sessionchecker = function() {
        $http({
            url: '/sessionchecker',
            method: 'GET'
        }).then(function(response) {
            self.usernameLogged = response.data;
        })
    };

    this.sessionchecker();
    // end sessionchecker


    // LOGIN FORM
    this.userlogin = function(login) {
        $http({
            method: 'POST',
            url: '/userlogin',
            data: login
        }).then(function(data) {
            console.log(data.data.sessionID);
            $scope.sessionID = data.data.sessionID
                // self.sessionID = data.data.sessionID
            self.usernameLogged = data.data.sessionID;
            console.log(self.usernameLogged);
        });
    }
    // END userlogin function


    // LOGOUT BUTTON
    this.logout = function() {
        $http({
            method: 'GET',
            url: '/logout',
        })
        $route.reload;
    }
    // END logout function


    var currentIcon;

    // CALLS FORECAST
    this.forecast = function(userLocation) {
        $http({
            url: '/forecast/' + userLocation.zipcode,
            method: 'GET',
        }).then(function(data) {

            self.darksky = data.data;

            self.sky = data.data.hourly.data

            var randColor = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();

            var skycons = new Skycons({ "color": randColor });


            //DARKSKIES-IO only gives the icon name. Not the icon itself.
            //Need to get the object icon name from the json and use another package as a callback.

            //GETTING THE ICON NAME FROM THE JSON
            var currentIcon = data.data.currently.icon.toUpperCase();

            //REMOVING THE " - " FROM THE DARKSKIES OBJECT AND MAKES INTO A " _ "
            var currentIcon2 = currentIcon.replace(/[_-]/g, "_");

            //USES THE OBJECT AS A CALLBACK
            skycons.add("icon1", Skycons[currentIcon2]);

            skycons.play();

            self.apprentTemp = data.data.currently.apparentTemperature + '℉';
            self.callDark(data.data.currently.apparentTemperature, $scope.selected)
        })
    };
    // END forecast function


    // Tells the user if their outfit is weather appropriate
    this.callDark = function(apparentTemperature, selected) {
        var mindif = apparentTemperature - selected.value.tempmin;
        if (mindif > 5) {
            self.resultDisplay = "Just right!"
            self.gilt(selected)
        }
    };
    // END callDark function


    // Gets the selection from dropdown
    $scope.clothingSelectLoad = function() {
        $http({
            url: '/clothing',
            method: 'GET',
        }).then(function(clothingDbData) {
            $scope.itemArray = clothingDbData.data;
            $scope.selected = {};
        });
    };
    // END clothingSelectLoad 


    // Calls clothing json from GILT based on keywords
    this.gilt = function(selected) {
        $scope.dataLoaded = false;

        $http({
            url: 'https://api.gilt.com/v1/products?q=' + selected.value.keywords + '&store=women&apikey=4f98486dc17f0323eb0a1c474784cfa025625669f94b331998e68fe6b82bd987',
            method: 'GET',
        }).then(function(data) {
            $scope.dataLoaded = true;

            var giltReturn = data.data.products.length + 1;
            var randOutfit = Math.floor(Math.random() * giltReturn);
            $scope.giltSuggest = data.data.products[randOutfit]
            $scope.giltSuggestImg = $scope.giltSuggest.image_urls["420x560"][0].url;
        })
    };
    // END gilt function


    // MODAL for EDIT CLOTHING
    this.editClothingModal = function(clothing) {
            $scope.clothing = clothing;
            ngDialog.open({
                template: '/partial/edit.html',
                controller: 'MainController',
                closeByEscape: true,
                scope: $scope
            });
        }
        // END editClothingModal function


    // EDIT EXISTING CLOTHING FROM ADMIN //
    this.editclothing = function(clothing) {
        console.log(clothing);
        $http({
            method: 'PUT',
            url: '/edit/' + clothing._id,
            data: clothing
        }).then(function(result) {
            // $scope.closeThisDialog();
            // $location.path('/admin')
        });
    }
    // END editclothing function


}]); 
// end MainController
