import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

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

				scope.$watch('vs.curViewPort', (newValue, oldValue) => {
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

				scope.$watch('vs.curMousePosSample', () => {
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
					ctx.strokeStyle = styles.colorBlack;
					ctx.font = (styles.fontInputSize.slice(0, -2) + 'px' + ' ' + styles.fontInputFamily);

					var gridWidth = canvas.width / 8;
					var gridHeight = canvas.height / 8;
					var sInterv = 1 / sRaSt.sampleRate - sRaSt.startTime;
					var curFrame = Math.round((scope.vs.curMousePosSample / scope.shs.audioBuffer.sampleRate) / sInterv);
					var binValStrArr;
					var curFrameVals = angular.copy(col.values[curFrame]);
					curFrameVals.reverse();

					curFrameVals.forEach((el, elIdx) => {
						binValStrArr = el.toString(2).split('').reverse();
						// pad with zeros
						while (binValStrArr.length < 8) {
							binValStrArr.push('0');
						}

						binValStrArr.forEach((binStr, binStrIdx) => {
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
					scope.fontImage.drawUndistortedTextTwoLines(ctx, 'EPG', 'Frame:' + curFrame, parseInt(styles.fontInputSize.slice(0, -2)) * 3 / 4, styles.fontInputFamily, 5, 0, styles.colorBlack, true);
				};
			}
		};
	});
