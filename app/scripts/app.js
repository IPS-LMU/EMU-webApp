'use strict';


angular.module('emulvcApp', ['ui', 'ui.bootstrap', 'ngRoute', 'ngAnimate', 'ngProgressLite'])
  .config(function($routeProvider, $locationProvider, ngProgressLiteProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);

    ngProgressLiteProvider.settings.speed = 1500;
  });
  
  