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
			// console.log($scope.ssffData);
		});
		
                
        $scope.resizeSpectro = function() {
                    alert("hier");
        }
        
        $scope.resizeOsci = function() {
                    alert("osci");
        }        		

	});