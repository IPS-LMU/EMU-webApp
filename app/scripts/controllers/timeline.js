'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http,
		viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = ConfigProviderService.vals.colors;
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;
		$scope.ssffData = [];

		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, data) {
			// $scope.vs.curViewPort.sS = 0;
			$scope.ssffData.push(data);
		});


		$scope.resizeSpectro = function() {
			if (viewState.getscrollSpectroOpen()) {
				viewState.setscrollSpectroOpen(false);
			} else {
				viewState.setscrollSpectroOpen(true);
			}
		};

		$scope.resizeOsci = function() {
			if (viewState.getscrollOsciOpen()) {
				viewState.setscrollOsciOpen(false);
			} else {
				viewState.setscrollOsciOpen(true);
			}
		};

	});