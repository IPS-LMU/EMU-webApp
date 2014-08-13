'use strict';


angular.module('emuwebApp')
	.directive('showMenu', function ($animate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.showMenu, function (newVal) {
					if (newVal) {
						$animate.addClass(element, 'emuwebapp-expandWidthTo200px');
					} else {
						$animate.removeClass(element, 'emuwebapp-expandWidthTo200px');
						$animate.addClass(element, 'emuwebapp-shrinkWidthTo0px');
					}
				});
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