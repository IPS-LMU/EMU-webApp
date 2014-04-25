'use strict';

angular.module('emuwebApp')
	.directive('emuwebapp', function (viewState, Iohandlerservice, ConfigProviderService) {
		return {
			templateUrl: 'views/emuwebapp.html',
			restrict: 'E',
			scope: {
				audioGetUrl: '@',
				labelGetUrl: '@',
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

				attrs.$observe('audioGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						console.log("VALUE!!!!! audioData");
						console.log(val);
					}
				});

				attrs.$observe('labelGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						console.log("VALUE!!!!! labelData");
						console.log(val);
					}
				});
			}
		};
	});