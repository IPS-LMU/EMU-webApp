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
		
		$scope.$watch('vs.heightOsci', function() {
			$(".OsciCanvas").height(viewState.getheightOsci());
			$(".SpectroCanvas").height(viewState.getheightSpectro());
			$(".SSFFCanvas").height(viewState.getheightSpectro());
			$(".emptyCanvas").height(viewState.getheightSpectro());
			
		}, true);			

		$scope.$watch('vs.heightSpectro', function() {
		    $(".OsciCanvas").height(viewState.getheightOsci());
			$(".SpectroCanvas").height(viewState.getheightSpectro());
			$(".SSFFCanvas").height(viewState.getheightSpectro());
			$(".emptyCanvas").height(viewState.getheightSpectro());
			
		}, true);			
		
        $scope.resizeSpectro = function() {
            var full = viewState.getheightSpectro() + viewState.getheightOsci();
            if(viewState.getscrollSpectroOpen()) {
                viewState.setscrollSpectroOpen(false);
                viewState.setheightSpectro(3*full/4);
                viewState.setheightOsci(full/4);
            }
            else {
                viewState.setscrollSpectroOpen(true);
                viewState.setheightSpectro(full/2);
                viewState.setheightOsci(full/2);
            }
        }
        
        $scope.resizeOsci = function() {
            var full = viewState.getheightSpectro() + viewState.getheightOsci();
            if(viewState.getscrollOsciOpen()) {
                viewState.setscrollOsciOpen(false);
                viewState.setheightSpectro(3*full/4);
                viewState.setheightOsci(full/4);

            }
            else {
                viewState.setscrollOsciOpen(true);
                viewState.setheightSpectro(full/2);
                viewState.setheightOsci(full/2);

            }
        }        		

	});