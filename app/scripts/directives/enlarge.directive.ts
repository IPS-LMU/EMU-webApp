import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('enlarge', function ($rootScope, ViewStateService, ConfigProviderService) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				scope.$watch('ViewStateService.curPerspectiveIdx', function () {
					if (!$.isEmptyObject(ConfigProviderService.vals.perspectives)) {
						if (!$.isEmptyObject(ViewStateService.curPerspectiveIdx)) {
							if (ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.order.length === 1) {
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
						ViewStateService.setenlarge(-1);
					} else {
						open = true;
						ViewStateService.setenlarge(parseInt(attrs.enlarge));
					}
					$rootScope.$apply();
				});
			}
		};
	});
