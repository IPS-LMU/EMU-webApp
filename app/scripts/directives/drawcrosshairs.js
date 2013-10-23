'use strict';

angular.module('emulvcApp')
	.directive('drawcrosshairs', function() {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {

				// element.text('this is the drawcrosshairs directive');

				// on mouse move
				element.bind('mousemove', function(event) {
					console.log()
					// switch (event.which) {
						// case 1:
							//console.log('Left mouse button pressed');
							// thisPCM = getX(event) * scope.vs.getPCMpp(event) + scope.vs.curViewPort.sS;
							// scope.vs.select(startPCM, thisPCM);
							// scope.$apply();
							// break;
					// }
				});
			}
		};
	});