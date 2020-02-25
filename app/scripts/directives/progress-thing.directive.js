'use strict';

angular.module('emuwebApp')
	.directive('progressThing', function ($animate) {
		return {
			template: '<div class="emuwebapp-progressThing">{{vs.somethingInProgressTxt}}</div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {
				// element.text('this is the progressThing directive');

				attrs.$observe('showThing', function (newVal) {
					if (newVal === 'true') {
						// $animate.removeClass(element, 'hideProgressThing');
						$animate.removeClass(element, 'emuwebapp-shrinkHeightTo0px');
						$animate.removeClass(element, 'emuwebapp-animationStopped');
						$animate.addClass(element, 'emuwebapp-expandHeightTo20px');
						$animate.addClass(element, 'emuwebapp-animationRunning');
					} else {
						// $animate.addClass(element, 'hideProgressThing');
						$animate.removeClass(element, 'emuwebapp-expandHeightTo20px');
						$animate.removeClass(element, 'emuwebapp-animationRunning');
						$animate.addClass(element, 'emuwebapp-shrinkHeightTo0px');
						$animate.addClass(element, 'emuwebapp-animationStopped');
					}
				});

			}
		};
	});