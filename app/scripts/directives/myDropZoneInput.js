'use strict';


angular.module('emuwebApp')
	.directive('myDropZoneInput', function () {
		return {
			templateUrl: 'views/myDropZoneInput.html',
			restrict: 'E',
			scope: {},
			link: function postLink(scope, element) {
				scope.acceptGrid = '.TextGrid';
				scope.acceptWav = 'audio/wav';
				scope.acceptJson = 'application/json';
				scope.acceptBoth = scope.acceptWav + ',' + scope.acceptGrid + ',' + scope.acceptJson;
				scope.acceptFile = scope.acceptBoth;

				scope.handleFilesonChange = function () {
					var loadedFiles = element[0].firstChild.files;
					scope.$parent.loadFiles(loadedFiles);
				};

				element.bind('change', function (event) {
					scope.handleFilesonChange(event);
				});

				element.bind('click', function () {
					var elem = angular.element('input');
					if (elem[1] !== undefined) {
						elem[1].click();
					}
				});

			}
		};
	});