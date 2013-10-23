'use strict';

angular.module('emulvcApp')
	.directive('drawcrosshairs', function() {
		return {
			restrict: 'A',
			link: function postLink(scope, element) {
				var canvas = element[0];

				// on mouse move
				element.bind('mousemove', function(event) {
					drawCrossHairs(scope.vs, canvas, scope.config, scope.dhs, event);
				});

				function drawCrossHairs(viewState, canvas, config, dhs, mouseEvt) {
					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.strokeStyle = config.vals.colors.crossHairsColor;
					ctx.fillStyle = config.vals.colors.crossHairsColor;

					// draw lines
					ctx.beginPath();
					ctx.moveTo(0, dhs.getY(mouseEvt));
					ctx.lineTo(canvas.width, dhs.getY(mouseEvt));
					ctx.moveTo(dhs.getX(mouseEvt), 0);
					ctx.lineTo(dhs.getX(mouseEvt), canvas.height);
					ctx.stroke();
				}

			}
		};
	});