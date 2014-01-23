'use strict';


angular.module('emulvcApp')
	.directive('showMenu', function ($animate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.showMenu, function (newVal) {
					if (newVal) {
						$animate.addClass(element, '.slideInMenu');
					} else {
						$animate.removeClass(element, '.slideInMenu');
					}
				})
			}
		};
	});


angular.module('emulvcApp').animation(".slideInMenu", function () {
	return {
		addClass: function (element, className) {
			element.addClass('slideLeftTestClass');
			// console.log(element)
			// TweenMax.to(element, 1, {
			// 	opacity: 0
			// });
		},
		removeClass: function (element, className) {
			// TweenMax.to(element, 1, {
			// 	opacity: 1
			// });
			elements.removeClass('slideLeftTestClass');
		}
	}
});