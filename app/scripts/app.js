'use strict';


angular.module('emuwebApp', ['ui', 'ui.bootstrap', 'ngAnimate', 'colorpicker.module'])
  .config(function($locationProvider) {
    // $routeProvider
    //   .when('/', {
    //     templateUrl: 'views/main.html'
    //   })
    //   .otherwise({
    //     redirectTo: '/'
    //   });
    $locationProvider.html5Mode(true);

  });
  
  