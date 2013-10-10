'use strict';

var HandletiersCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, viewState, Soundhandlerservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;

	});