import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('epg', function () {
		return {
			template: '<div class="emuwebapp-twoDimCanvasContainer"><canvas width="512" height="512"></canvas></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element) {
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

				scope.$watch('vs.curMousePosSample', function () {
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

					var ctx = canvas.getContext('2d');
					tr = scope.cps.getSsffTrackConfig('EPG'); // SIC SIC SIC hardcoded for now although it might stay that way because it only is allowed to draw epg data anyway
					col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
					sRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(tr.name);
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = 'green';
					ctx.strokeStyle = scope.cps.design.color.black;
					ctx.font = (scope.cps.design.font.input.size.slice(0, -2) + 'px' + ' ' + scope.cps.design.font.input.family);

					var gridWidth = canvas.width / 8;
					var gridHeight = canvas.height / 8;
					var sInterv = 1 / sRaSt.sampleRate - sRaSt.startTime;
					var curFrame = Math.round((scope.vs.curMousePosSample / scope.shs.audioBuffer.sampleRate) / sInterv);
					var binValStrArr;
					var curFrameVals = angular.copy(col.values[curFrame]);
					curFrameVals.reverse();

					angular.forEach(curFrameVals, function (el, elIdx) {
						binValStrArr = el.toString(2).split('').reverse();
						// pad with zeros
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
						});
					});

					// draw labels
					scope.fontImage.drawUndistortedTextTwoLines(ctx, 'EPG', 'Frame:' + curFrame, scope.cps.design.font.input.size.slice(0, -2) * 3 / 4, scope.cps.design.font.input.family, 5, 0, scope.cps.design.color.black, true);
				};
			}
		};
	});
