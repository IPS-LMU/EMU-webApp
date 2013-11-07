'use strict';


angular.module('emulvcApp', ['ui', 'ui.bootstrap', 'ngRoute', 'snap'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
    
  });