'use strict';


angular.module('emuwebApp')
	.directive('hint', function () {
		return {
			templateUrl: 'views/hint.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				scope.showAboutHint = attrs.show;
				scope.hideMe = function () {
					scope.showAboutHint = !scope.showAboutHint;
					scope.aboutBtnClick();
		 		};
			}
		};
	});
