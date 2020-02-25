'use strict';

angular.module('emuwebApp')
	.directive('emuwebapp', function (viewState, Iohandlerservice, ConfigProviderService) {
		return {
			templateUrl: 'views/emuwebapp.html',
			restrict: 'E',
			scope: {
				audioGetUrl: '@',
				labelGetUrl: '@',
				labelType: '@'
			},
			link: function postLink(scope, element, attrs) {

				////////////////////////
				// Bindings
				element.bind('mouseenter', function () {
					viewState.mouseInEmuWebApp = true;

				});

				element.bind('mouseleave', function () {
					viewState.mouseInEmuWebApp = false;
				});

				///////////////////////
				// observe attrs

				attrs.$observe('audioGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.audioGetUrl = val;
					}
				});

				attrs.$observe('labelGetUrl', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.labelGetUrl = val;
					}
				});

				attrs.$observe('labelType', function (val) {
					if (val !== undefined && val !== '') {
						ConfigProviderService.embeddedVals.labelType = val;
					}
				});
			}
		};
	});