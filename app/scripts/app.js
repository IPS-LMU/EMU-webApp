'use strict';

angular.module('emuwebApp', ['ngAnimate', 'angular.filter', 'btford.markdown'])
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(true);
	});
