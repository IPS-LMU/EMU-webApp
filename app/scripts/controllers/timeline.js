'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, viewState, Soundhandlerservice, Colorproviderservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = Colorproviderservice;

		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, data) {

			// for development
			// $scope.viewState.curViewPort.sS = 100;
			// $scope.viewState.curViewPort.eS = 1000;
			// $scope.viewState.bufferLength = $scope.viewState.curViewPort.eS;
			// console.log(data)
		});

	});