'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, viewState, Soundhandlerservice, Colorproviderservice, Drawhelperservice) {

		$scope.vs = viewState;
		$scope.shs = Soundhandlerservice;
		$scope.cps = Colorproviderservice;
		$scope.dhs = Drawhelperservice;
		$scope.ssffData = [];
		
		/**
		 * listen for newlyLoadedSSFFfile broadcast
		 */
		$scope.$on('newlyLoadedSSFFfile', function(evt, data) {
			$scope.ssffData.push(data);
		});
		
		$scope.$watch('vs.scroll', function() {
			$(".OsciCanvas").height(viewState.getheightOsci()+(viewState.getscroll()/2));
			$(".SpectroCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".SSFFCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".emptyCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
		}, true);	
		
        $scope.resizeSpectro = function() {
            var full = $scope.cps.vals.canvasFull;
            if(viewState.getscrollSpectroOpen()) {
                viewState.setscrollSpectroOpen(false);
                viewState.setscrollHSpectro(full);
                viewState.setscrollHOsci(100-full);
            }
            else {
                viewState.setscrollSpectroOpen(true);
                viewState.setscrollHSpectro(50);
                viewState.setscrollHOsci(50);
            }
        }
        
        $scope.resizeOsci = function() {
            var multiplier = $scope.cps.vals.canvasMultiplier;
            if(viewState.getscrollOsciOpen()) {
                viewState.setscrollOsciOpen(false);
                viewState.setscrollHSpectro(100-full);
                viewState.setscrollHOsci(full);

            }
            else {
                viewState.setscrollOsciOpen(true);
                viewState.setscrollHSpectro(50);
                viewState.setscrollHOsci(50);

            }
        }        		

	});