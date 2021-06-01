import * as angular from 'angular';

angular.module('emuwebApp', ['ngAnimate', 'angular.filter', 'ngRoute'])
	.config(['$locationProvider', function ($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);
