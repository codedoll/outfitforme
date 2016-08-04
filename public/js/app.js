var app = angular.module('OutfitForMe', ['ngRoute', 'angularMoment', 'ngRoute', 'ui.select', 'ngSanitize', 'ngDialog', ]);

// app.run(function(amMoment) {
//     amMoment.changeLocale('de');
// });

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function(item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider.when('/', {
        templateUrl: 'partial/home.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    }).when('/admin', {
        templateUrl: 'admin.html',
        controller: 'MainController',
        controllerAs: 'mctrl'
    })


}])




app.controller('MainController', ['$http', '$scope', '$routeParams', '$route', 'ngDialog', function($http, $scope, $routeParams, $route, ngDialog) {

    var self = this;

    $scope.sayHi = "HI"
    
    $scope.name = "bella";

    //GET ALL CLOTHING VALUES IN DB
    $scope.adminLoad = function() {
        $http({
            url: '/clothing',
            method: 'GET',
        }).then(function(clothingDbData) {
            console.log(clothingDbData.data);
            self.clothingDbData = clothingDbData.data;
        });
        //END adminLoad function
    };

    moment.tz.add([
        'America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0',
        'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0'
    ]);


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

        console.log(userLocation)
        $http({
            url: '/forecast/' + userLocation.zipcode,
            method: 'GET',
        }).then(function(data) {
            console.log(data.data);

            self.darksky = data.data;

            self.sky = data.data.hourly.data

            var skycons = new Skycons({ "color": "orange" });

            var currentIcon = data.data.currently.icon.toUpperCase();

            var currentIcon2 = currentIcon.replace(/[_-]/g, "_");
            
            skycons.add("icon1", Skycons[currentIcon2]);

            skycons.play();
            self.apprentTemp = data.data.currently.apparentTemperature + '℉';

            self.callDark(data.data.currently.apparentTemperature)

        })
    };

    this.callDark = function(data) {
            console.log(data);
    }


    $scope.clothingSelectLoad = function() {

        $http({
            url: '/clothing',
            method: 'GET',
        }).then(function(clothingDbData) {
            console.log(clothingDbData.data);
            $scope.itemArray = clothingDbData.data;
            $scope.selected = {};
            console.log($scope.selected);
        });
        // END clothingSelectLoad 
    };


    // MODAL for EDIT CLOTHING
    this.editClothingModal = function(clothing) {
        $scope.clothing = clothing;
            ngDialog.open({
                template: '/partial/edit.html',
                controller: 'MainController',
                scope: $scope
            });
            // ngDialog.open({
            //     template: '/partial/edit.html',
            //     // className: 'ngdialog-theme-plain',
            //     controller: 'MainController',
            //     scope: $scope
            // });
            // };

        }
        // end MODAL for EDIT CLOTHING

}]); // end MainController
