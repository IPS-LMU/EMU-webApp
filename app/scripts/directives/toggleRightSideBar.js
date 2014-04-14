'use strict';


angular.module('emuwebApp')
	.directive('showMenu', function ($animate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.showMenu, function (newVal) {
					if (newVal) {
						// alert("asdfadsfadsgfadsfgafgadfgadfg!!!!!!!!!")
						// $animate.addClass(element, '.slideInMenu');
						$animate.removeClass(element, 'slideRight');
						$animate.addClass(element, 'slideLeft');
					} else {
						// alert("123412345345asdfadsfadsgfadsfgafgadfgadfg!!!!!!!!!")
						// $animate.removeClass(element, '.slideInMenu');
						$animate.removeClass(element, 'slideLeft');
						$animate.addClass(element, 'slideRight');
					}
				})
			}
		};
	});

// simple animation to add slideLeft class
angular.module('emuwebApp').animation('.slideInMenu', function () {
	return {
		addClass: function (element, className) {
			element.addClass('slideLeft');
		},
		removeClass: function (element, className) {
			element.removeClass('slideLeft');
		}
	}
});