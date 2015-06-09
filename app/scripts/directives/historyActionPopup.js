'use strict';

angular.module('emuwebApp')
	.directive('historyActionPopup', function ($animate, $timeout) {
		return {
			template: '<div class="emuwebapp-history"><div ng-bind-html="vs.historyActionTxt"></div></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {

				////////////////
				//watches

				scope.$watch('vs.historyActionTxt', function () {
					if (scope.vs.historyActionTxt !== '') {
						$animate.addClass(element, 'emuwebapp-history-fade').then(function () {
							scope.$apply();
							$timeout(function () {
								$animate.removeClass(element, 'emuwebapp-history-fade').then(function () {
									$timeout(function () {
										scope.vs.historyActionTxt = '';
									}, scope.cps.design.animation.period * 2);
									scope.$apply();
								})
							}, scope.cps.design.animation.period * 2);
						});
					}


				}, true);

			}
		};
	});
