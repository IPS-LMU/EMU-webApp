'use strict';


angular.module('emuwebApp', ['ui', 'ui.sortable', 'ngAnimate', 'angular.filter'])
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  });   
  