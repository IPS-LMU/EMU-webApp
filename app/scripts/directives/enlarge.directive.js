'use strict';

angular.module('emuwebApp')
	.directive('enlarge', function ($rootScope, viewState, ConfigProviderService) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				scope.$watch('viewState.curPerspectiveIdx', function () {
					if (!$.isEmptyObject(ConfigProviderService.vals.perspectives)) {
						if (!$.isEmptyObject(viewState.curPerspectiveIdx)) {
							if (ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length === 1) {
								element.hide();
							}
							else {
								element.show();
							}
						}
					}
				}, true);
				var open = false;
				element.bind('click', function () {
					if (open) {
						open = false;
						viewState.setenlarge(-1);
					} else {
						open = true;
						viewState.setenlarge(parseInt(attrs.enlarge));
					}
					$rootScope.$apply();
				});
			}
		};
	});
