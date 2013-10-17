'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, viewState, Soundhandlerservice, Colorproviderservice, Drawhelperservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = Colorproviderservice;
		$scope.dhs = Drawhelperservice;
		$scope.ssffData = [];
		
		var osciOpen = true;
		var spectroOpen = true;

		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, data) {
			$scope.ssffData.push(data);
			// console.log($scope.ssffData);
		});
		
                
        $scope.resizeSpectro = function() {
            var now = viewState.getscrollHSpectro();
            if(spectroOpen) {
                spectroOpen = false;
                viewState.setscrollHSpectro(now/2);
            }
            else {
                spectroOpen = true;
                viewState.setscrollHSpectro(now*2);
            }
        }
        
        $scope.resizeOsci = function() {
            var now = viewState.getscrollHOsci();
            if(osciOpen) {
                osciOpen = false;
                viewState.setscrollHOsci(now/2);
            }
            else {
                osciOpen = true;
                viewState.setscrollHOsci(now*2);
            }
        }        		

	});