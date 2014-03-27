'use strict';

angular.module('emuwebApp')
	.controller('TimelineCtrl', function ($scope, Drawhelperservice) {
		$scope.dhs = Drawhelperservice;
	});