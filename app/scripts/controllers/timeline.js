'use strict';

angular.module('emuwebApp')
	.controller('TimelineCtrl', function ($scope, $http, $compile,
		viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService, Ssffdataservice, HistoryService) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = ConfigProviderService.vals.colors; // SIC bad bad name!!!!
		$scope.config = ConfigProviderService;
		$scope.dhs = Drawhelperservice;
		$scope.ssffds = Ssffdataservice;
		$scope.hists = HistoryService;

		// $scope.showSSFFOsci = false;
		// $scope.showSSFFSpectro = true; // SIC SIC SIC


		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		// $scope.$on('newlyLoadedSSFFfile', function (evt, data) {
		// 	// $scope.vs.curViewPort.sS = 0;
		// 	$scope.ssffds.data = []; // SIC HACK! NO idea why event is fired twice...
		// 	$scope.ssffds.data.push(data);
		// 	for (var key in ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign[0]) {
		// 		console.log(key);
		// 		if (ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.assign[key] === 'formants') {
		// 			if (key === 'OSCI') {
		// 				$scope.showSSFFOsci = true;
		// 			}
		// 			if (key === 'SPEC') {
		// 				$scope.showSSFFSpectro = true;
		// 			}
		// 		}
		// 	}
		// });

		/**
		 * clear ssff data when new utt is loaded
		 */
		// $scope.$on('loadingNewUtt', function () {
		// 	$scope.ssffds.data = [];
		// });

	});