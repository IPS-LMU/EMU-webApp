'use strict';

angular.module('emuwebApp')
	.directive('historyActionPopup', function ($animate) {
		return {
			template: '<div class="emuwebapp-historyActionPopup"> <div class="emuwebapp-historyActionModal">{{vs.historyActionTxt}}</div></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {

				////////////////
				//watches

				scope.$watch('vs.historyActionTxt', function () {
					if (scope.vs.historyActionTxt !== '') {
						$animate.addClass(element, 'emuwebapp-historyActionPopupThere').then(function () {
							scope.vs.historyActionTxt = '';
							$animate.removeClass(element, 'emuwebapp-historyActionPopupThere');
							scope.$apply();
						});
					}


				}, true);

			}
		};
	});