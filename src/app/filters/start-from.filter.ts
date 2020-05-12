import * as angular from 'angular';

/**
 * @ngdoc filter
 * @name emuwebApp.filter:startFromFilter
 * @function
 * @description
 * # startFromFilter
 * Filter in the emuwebApp.
 */
angular.module('emuwebApp')
	.filter('startFrom', function () {
		return function (input, start) {
			start = +start; //parse to int
			return input.slice(start);
		};
	});