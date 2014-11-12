'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function ($animate) {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			scope: {
				isOpen: '@'
			},
			link: function postLink(scope, element, attr) {

				////////////////
				// observes
				attr.$observe('isOpen', function (value) {
					if (value === 'true') {
						$animate.removeClass(element, 'emuwebapp-shrinkWidthTo0px');
						$animate.addClass(element, 'emuwebapp-expandWidthTo240px');
					} else {
						$animate.addClass(element, 'emuwebapp-shrinkWidthTo0px');
					}
				});
			}
		};
	});