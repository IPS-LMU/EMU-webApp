import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('historyActionPopup', function ($animate, $timeout, ConfigProviderService) {
		return {
			template: '<div class="emuwebapp-history"><div ng-bind-html="vs.historyActionTxt"></div></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element) {
				////////////////
				//watches
				scope.cps = ConfigProviderService;
				scope.$watch('vs.historyActionTxt', function () {
					if (scope.vs.historyActionTxt !== '') {
						$animate.addClass(element, 'emuwebapp-history-fade').then(function () {
							$timeout(function () {
								$animate.removeClass(element, 'emuwebapp-history-fade').then(function () {
									$timeout(function () {
										scope.vs.historyActionTxt = '';
									}, scope.cps.design.animation.period);
								});
							}, scope.cps.design.animation.period);
						});
					}
				}, true);
			}
		};
	});
