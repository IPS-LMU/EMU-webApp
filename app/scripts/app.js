'use strict';


angular.module('emuwebApp', ['ui', 'ui.bootstrap', 'ngAnimate', 'angular.filter'])
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  });   
  