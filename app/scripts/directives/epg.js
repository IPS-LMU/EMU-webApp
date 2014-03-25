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

					var tr = scope.cps.getSsffTrackConfig("EPG"); // SIC SIC SIC hardcoded for now
					var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
					var sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);


					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					ctx.fillStyle = scope.cps.vals.colors.osciColor;
					ctx.strokeStyle = scope.cps.vals.colors.osciColor;

					// lines to corners


					var gridWidth = canvas.width / 8;
					var gridHeight = canvas.height / 8;

					col.values[0].forEach(function (el, elIdx) {
						var binValStrArr = el.toString(2).split('').reverse();
						
						while (binValStrArr.length < 8) {
							binValStrArr.push('0');
						}

						binValStrArr.forEach(function (binStr, binStrIdx) {
							// 	console.log(binStr)
							if (binStr === '1') {
								ctx.rect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
								ctx.fill();
								ctx.stroke();
							}
						})
					});
				}
			}
		};
	});