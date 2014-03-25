'use strict';

angular.module('emuwebApp')
	.directive('epg', function (viewState) {
		return {
			template: '<div class="twoDimCanvasContainer"><canvas width="256" height="256"></canvas></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {
				// element.text('this is the epg directive');
				var canvas = element.find('canvas')[0]


				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawEpgGrid(scope);
							}
						}
					}
				}, true);

				function drawEpgGrid(scope) {

					var tr = scope.cps.getSsffTrackConfig("EPG");
					// var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
					// var sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);


					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					ctx.fillStyle = scope.cps.vals.colors.osciColor;
					ctx.strokeStyle = scope.cps.vals.colors.osciColor;

					// lines to corners
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(5, 5);
					ctx.moveTo(canvas.width, 0);
					ctx.lineTo(canvas.width - 5, 5);
					ctx.closePath();
					ctx.stroke();
				}
			}
		};
	});