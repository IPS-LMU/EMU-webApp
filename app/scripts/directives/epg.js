'use strict';

angular.module('emuwebApp')
	.directive('epg', function (viewState) {
		return {
			template: '<div class="emuwebapp-twoDimCanvasContainer"><canvas width="512" height="512"></canvas></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {
				// element.text('this is the epg directive');
				var canvas = element.find('canvas')[0];

				var tr, col, sRaSt;

				////////////////////
				// watches

				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
									scope.drawEpgGrid(scope);
								}
							}
						}
					}
				}, true);

				scope.$watch('vs.curMousePosSample', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								scope.drawEpgGrid(scope);
							}
						}
					}
				}, true);

				//
				////////////////////

				/**
				 * drawing method to drawEpgGrid
				 */
				 scope.drawEpgGrid = function (scope) {

					tr = scope.cps.getSsffTrackConfig('EPG'); // SIC SIC SIC hardcoded for now although it might stay that way because it only is allowed to draw epg data anyway
					col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
					sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);

					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					ctx.fillStyle = 'green';
					ctx.strokeStyle = scope.cps.vals.colors.osciColor;
					ctx.font = (scope.cps.vals.font.fontPxSize + 'px' + ' ' + scope.cps.vals.font.fontType);

					var gridWidth = canvas.width / 8;
					var gridHeight = canvas.height / 8;

					var sInterv = 1 / sRaSt.sampleRate - sRaSt.startTime;
					var curFrame = Math.round((scope.vs.curMousePosSample / scope.shs.wavJSO.SampleRate) / sInterv);
					console.log(curFrame);

					var binValStrArr;
					angular.forEach(col.values[curFrame], function (el, elIdx) {
						binValStrArr = el.toString(2).split('').reverse();
						while (binValStrArr.length < 8) {
							binValStrArr.push('0');
						}

						binValStrArr.forEach(function (binStr, binStrIdx) {
							if (binStr === '1') {
								ctx.fillStyle = 'grey';
								ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
							} else {
								ctx.fillStyle = 'white';
								ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
							}
						})
					});

					// draw labels
					var horizontalText = scope.fontImage.getTextImageTwoLines(ctx, 'EPG', 'Frame:' + curFrame, scope.cps.vals.font.fontPxSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, 0, horizontalText.width, horizontalText.height);
				}
			}
		};
	});