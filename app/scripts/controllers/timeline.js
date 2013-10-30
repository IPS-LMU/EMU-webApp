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
		
		$scope.drop = function(dragEl, dropEl) {
		    if(dragEl.id=="dragSsff") {
		        var elem = angular.element(dropEl);
				var ssff = $('<canvas>').attr({
					'width': '2048',
					'height': '128',
					'class': 'SSFFCanvas',
					'id': 'SSFFCanvas',
					'drawssff': 'fm',
					'correctiontool': ''
				});
				$compile(ssff)($scope);
		        elem.children().children().last().before(ssff);
		        $scope.$apply();
		    }
		}		

	});