'use strict';


angular.module('emuwebApp')
	.directive('hint', function () {
		return {
			templateUrl: 'views/hint.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope) {
				scope.hideMe = function () {
					scope.internalVars.showAboutHint = !scope.internalVars.showAboutHint;
					scope.aboutBtnClick();
				};
			}
		};
	});
