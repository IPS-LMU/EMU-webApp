'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, $compile,
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
		
		/**
		 * clear ssff data when new utt is loaded
		 */
		$scope.$on('loadingNewUtt', function(evt) {
				$scope.ssffData = [];
	        
		});		
  


		$scope.resizeSpectro = function() {
			if (viewState.getscrollOpen()==0) {
				viewState.setscrollOpen(1);
			} else {
				viewState.setscrollOpen(0);
			}
		};

		$scope.resizeOsci = function() {
			if (viewState.getscrollOpen()==0) {
				viewState.setscrollOpen(2);
			} else {
				viewState.setscrollOpen(0);
			}
		};				

	});