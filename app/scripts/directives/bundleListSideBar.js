'use strict';


angular.module('emuwebApp')
	.directive('bundleListSideBar', function ($animate, viewState) {
		return {
			templateUrl: 'views/bundleListSideBar.html',
			restrict: 'E',
			replace: true,
			// scope:{},
			link: function postLink(scope, element, attr) {

				////////////////
				//watches

				scope.$watch('vs.submenuOpen', function () {
					if (scope.vs.submenuOpen) {
						$animate.removeClass(element, 'emuwebapp-shrinkWidthTo0px');
						$animate.addClass(element, 'emuwebapp-expandWidthTo240px');
					} else {
						$animate.addClass(element, 'emuwebapp-shrinkWidthTo0px');
					}
				}, true);
			}
		};
	});