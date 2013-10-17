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
		var multiplier = 2;

		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, data) {
			$scope.ssffData.push(data);
			// console.log($scope.ssffData);
		});
		
		$scope.$watch('vs.scroll', function() {
		    console.log("scroll");
		}, true);			
		
                
        $scope.resizeSpectro = function() {
            if(spectroOpen) {
                spectroOpen = false;
                viewState.setscrollHSpectro(Math.floor(viewState.getscrollHSpectro() / multiplier));
            }
            else {
                spectroOpen = true;
                viewState.setscrollHSpectro(Math.floor(viewState.getscrollHSpectro() * multiplier));
            }
        }
        
        $scope.resizeOsci = function() {
            if(osciOpen) {
                osciOpen = false;
                viewState.setscrollHOsci(Math.floor(viewState.getscrollHOsci() / multiplier));
            }
            else {
                osciOpen = true;
                viewState.setscrollHOsci(Math.floor(viewState.getscrollHOsci() * multiplier));
            }
        }        		

	});