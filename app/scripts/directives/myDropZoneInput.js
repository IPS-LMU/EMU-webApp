'use strict';


angular.module('emuwebApp')
	.directive('myDropZoneInput', function ($animate, browserDetector, appStateService) {
		return {
			templateUrl: 'views/myDropZoneInput.html',
			restrict: 'E',
			scope: {},
			link: function postLink(scope, element, attr) {
				scope.acceptGrid = '.TextGrid';
				scope.acceptWav = 'audio/wav';
				scope.acceptJson = 'application/json';
				scope.acceptBoth = scope.acceptWav + ',' + scope.acceptGrid + ',' + scope.acceptJson;
				scope.acceptFile = scope.acceptBoth;

				scope.handleFilesonChange = function () {
					var loadedFiles = element.context.children.fileDialog;
					scope.$parent.loadFiles(loadedFiles.files);
				}

				element.bind('change', function (event) {
					scope.handleFilesonChange(event);
				});

				element.bind('click', function (event) {
					var elem = angular.element('input');
					if (elem[1] !== undefined) {
						elem[1].click();
					}
				});

			}
		}
	});