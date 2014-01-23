'use strict';


angular.module('emulvcApp', ['ui', 'ui.bootstrap', 'ngRoute', 'ngAnimate'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
    
  });
  
  