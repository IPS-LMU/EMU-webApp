'use strict';

angular.module('emuwebApp')
	.directive('emuwebapp', function (viewState) {
		return {
			templateUrl: 'views/emuwebapp.html',
			restrict: 'E',
			scope: {
				audioData: '@',
				labelData: '@',
				labelDataType: '@'
			},
			link: function postLink(scope, element, attrs) {
				////////////////////////
				// Bindings
				element.bind('mouseenter', function (event) {
					viewState.mouseInEmuWebApp = true;

				});
				element.bind('mouseleave', function (event) {
					viewState.mouseInEmuWebApp = false;
				});

				///////////////////////
				// observe attrs
				attrs.$observe('labelDataType', function (val) {
					if (val !== undefined && val !== '') {
						console.log("VALUE!!!!! labelDataType");
						console.log(val);
					}
				});

				attrs.$observe('audioData', function (val) {
					if (val !== undefined && val !== '') {
						console.log("VALUE!!!!! audioData");
						console.log(val);
					}
				});

				attrs.$observe('labelData', function (val) {
					if (val !== undefined && val !== '') {
						console.log("VALUE!!!!! labelData");
						console.log(val);
					}
				});
			}
		};
	});