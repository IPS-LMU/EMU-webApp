'use strict';


angular.module('emuwebApp')
	.directive('hint', function () {
		return {
			templateUrl: 'views/hint.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				scope.hideMe = function () {
					viewState.showAboutHint = !viewState.showAboutHint;
					scope.aboutBtnClick();
		 		};
			}
		};
	});
