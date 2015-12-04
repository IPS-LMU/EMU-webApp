'use strict';

angular.module('emuwebApp')
	.directive('slideToggle', function () {
		return {
			restrict: 'A',
			scope: {
				isOpen: "=slideToggle" // 'data-slide-toggle' in our html
			},
			link: function (scope, element, attr) {
				var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
				// trigger a slideToggle at initialization
				if (scope.isOpen) {
				}
				else {
					element.stop().slideToggle(0);
				}
				// Watch for when the value bound to isOpen changes
				// When it changes trigger a slideToggle
				scope.$watch('isOpen', function (newIsOpenVal, oldIsOpenVal) {
					if (newIsOpenVal !== oldIsOpenVal) {
						element.stop().slideToggle(slideDuration);
					}
				});
			}
		};
	});
