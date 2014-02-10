'use strict';


angular.module('emulvcApp')
	.directive('showTwod', function ($animate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.showTwod, function (newVal) {
					if (newVal) {
						$animate.addClass(element, '.slideIn2dCanvases');
					} else {
						$animate.removeClass(element, '.slideIn2dCanvases');
					}

				})
			}
		};
	});

// simple animation to add slideLeft class
angular.module('emulvcApp').animation(".slideIn2dCanvases", function () {
	return {
		addClass: function (element, className) {
			element.addClass('slide2dCanvases');
			console.log('plus');
		},
		removeClass: function (element, className) {
			element.removeClass('slide2dCanvases');
			console.log('minus');
		}
	}
});