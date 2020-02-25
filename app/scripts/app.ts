import * as angular from 'angular';

angular.module('emuwebApp', ['ngAnimate', 'angular.filter'])
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(true);
	});
