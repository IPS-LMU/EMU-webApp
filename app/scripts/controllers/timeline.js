'use strict';

var TimelineCtrl = angular.module('emulvcApp')
	.controller('TimelineCtrl', function($scope, $http, 
	  viewState, Soundhandlerservice, Drawhelperservice,ConfigProviderService) {

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
		
		$scope.$watch('vs.scroll', function() {
			$(".OsciCanvas").height(viewState.getheightOsci()+(viewState.getscroll()/2));
			$(".SpectroCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".SSFFCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".emptyCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
		}, true);
		
		$scope.$watch('vs.heightOsci', function() {
			$(".OsciCanvas").height(viewState.getheightOsci()+(viewState.getscroll()/2));
			$(".SpectroCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".SSFFCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".emptyCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			
		}, true);			

		$scope.$watch('vs.heightSpectro', function() {
		    $(".OsciCanvas").height(viewState.getheightOsci()+(viewState.getscroll()/2));
			$(".SpectroCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".SSFFCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			$(".emptyCanvas").height(viewState.getheightSpectro()+(viewState.getscroll()/2));
			
		}, true);			
		
        $scope.resizeSpectro = function() {
            var i = $scope.config.vals.main.osciSpectroZoomFactor;
            var full = viewState.getheightSpectro() + viewState.getheightOsci();
            if(viewState.getscrollSpectroOpen()) {
                viewState.setscrollSpectroOpen(false);
                viewState.setheightSpectro(((i-1)*full)/i);
                viewState.setheightOsci(full/i);
            }
            else {
                viewState.setscrollSpectroOpen(true);
                viewState.setheightSpectro(full/2);
                viewState.setheightOsci(full/2);
            }
        }
        
        $scope.resizeOsci = function() {
            var i = $scope.config.vals.main.osciSpectroZoomFactor;
            var full = viewState.getheightSpectro() + viewState.getheightOsci();
            if(viewState.getscrollOsciOpen()) {
                viewState.setscrollOsciOpen(false);
                viewState.setheightSpectro(full/i);
                viewState.setheightOsci(((i-1)*full)/i);

            }
            else {
                viewState.setscrollOsciOpen(true);
                viewState.setheightSpectro(full/2);
                viewState.setheightOsci(full/2);

            }
        }        		

	});