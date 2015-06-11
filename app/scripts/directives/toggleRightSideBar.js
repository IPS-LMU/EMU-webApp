'use strict';


angular.module('emuwebApp')
	.directive('showMenu', function ($animate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.showMenu, function (newVal) {
					if (newVal) {
						$animate.addClass(element, 'emuwebapp-expandWidthTo200px');
						$animate.removeClass(element, 'emuwebapp-shrinkWidthTo0px');
					} else {
						$animate.removeClass(element, 'emuwebapp-expandWidthTo200px');
						$animate.addClass(element, 'emuwebapp-shrinkWidthTo0px');
					}
				});
			}
		};
	});
