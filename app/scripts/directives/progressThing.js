'use strict';

angular.module('emuwebApp')
	.directive('progressThing', function ($animate) {
		return {
			template: '<div class=progressThing>{{vs.somethingInProgressTxt}}</div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {
				// element.text('this is the progressThing directive');

				attrs.$observe('showThing', function (newVal) {
					if (newVal==='true') {
						$animate.removeClass(element, 'hideProgressThing');
					} else {
						$animate.addClass(element, 'hideProgressThing');
					}
				});

			}
		};
	});