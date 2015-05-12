'use strict';

angular.module('emuwebApp')
	.directive('historyActionPopup', function ($animate) {
		return {
			template: '<div class="emuwebapp-history"><div>{{vs.historyActionTxt}}</div></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {

				////////////////
				//watches

				scope.$watch('vs.historyActionTxt', function () {
					if (scope.vs.historyActionTxt !== '') {
						$animate.addClass(element, 'emuwebapp-history-fade').then(function () {
							scope.vs.historyActionTxt = '';
							$animate.removeClass(element, 'emuwebapp-history-fade');
							scope.$apply();
						});
					}


				}, true);

			}
		};
	});
