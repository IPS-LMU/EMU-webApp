'use strict';

angular.module('emuwebApp', ['ui', 'ngAnimate', 'angular.filter', 'btford.markdown'])
	.config(function ($locationProvider) {
		$locationProvider.html5Mode(true);
	});

angular.element(document).ready(function() {
	angular.bootstrap(document, ['emuwebApp']);
});