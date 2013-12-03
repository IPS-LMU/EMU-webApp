'use strict';

angular.module('emulvcApp')
	.controller('TimelineCtrl', function ($scope, $http, $compile,
		viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService, Ssffdataservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = ConfigProviderService.vals.colors;
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;
		$scope.ssffds = Ssffdataservice;

		$scope.showSSFFOsci = false;
		$scope.showSSFFSpectro = false;


		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function (evt, data) {
			// $scope.vs.curViewPort.sS = 0;
			$scope.ssffds.data = []; // SIC HACK! NO idea why event is fired twice...
			$scope.ssffds.data.push(data);
			for (var key in ConfigProviderService.vals.signalsCanvasConfig.assign) {
				if (ConfigProviderService.vals.signalsCanvasConfig.assign[key] === 'fms:fm') {
					if (key === 'osci') {
						$scope.showSSFFOsci = true;
					}
					if (key === 'spec') {
						$scope.showSSFFSpectro = true;
					}
				}
			}
		});

		/**
		 * clear ssff data when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function () {
			$scope.ssffds.data = [];
		});


		/**
		 *
		 */
		$scope.resizeSpectro = function () {
			if (viewState.getscrollOpen() === 0) {
				viewState.setscrollOpen(1);
			} else {
				viewState.setscrollOpen(0);
			}
		};


		/**
		 *
		 */
		$scope.resizeOsci = function () {
			if (viewState.getscrollOpen() === 0) {
				viewState.setscrollOpen(2);
			} else {
				viewState.setscrollOpen(0);
			}
		};

	});