'use strict';

angular.module('emuwebApp')
	.directive('dots', function (viewState) {
		return {
			template: '<div class="twoDimCanvasContainer"><canvas width="256" height="256"></canvas></div>',
			restrict: 'E',
			replace: true,
			link: function postLink(scope, element, attrs) {
				// element.text('this is the epg directive');
				var canvas = element.find('canvas')[0];

				var globalMinX = Infinity;
				var globalMaxX = -Infinity;
				var globalMinY = Infinity;
				var globalMaxY = -Infinity;
				
				var tr, col, sRaSt;

				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawDots(scope);
							}
						}
					}
				}, true);

				scope.$watch('vs.curMousePosSample', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawDots(scope);
							}
						}
					}
				}, true);

				/**
				 * drawing method to drawDots
				 */

				function drawDots(scope) {
					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					var dD = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0]; // SIC SIC SIC hardcoded

					for (var i = 0; i < dD.dots.length; i++) {

						// get xCol
						var trConf = scope.cps.getSsffTrackConfig(dD.dots[i].xSsffTrack);
						var xCol = scope.ssffds.getColumnOfTrack(trConf.name, trConf.columnName);

						// get yCol
						trConf = scope.cps.getSsffTrackConfig(dD.dots[i].ySsffTrack);
						var yCol = scope.ssffds.getColumnOfTrack(trConf.name, trConf.columnName);

						// check for only one value in column... might change in future
						if (xCol.length !== yCol.length || xCol.length !== 1 || yCol.length !== 1) {
							alert('colomns do not have same length or length of one not 1');
							return;
						}

						var xsRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(dD.dots[i].xSsffTrack);
						var ysRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(dD.dots[i].ySsffTrack);

						// check if sampleRate and startTime is the same
						if (xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample) {
							alert('xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample');
							return;
						}

						var sInterv = 1 / xsRaSt.sampleRate - xsRaSt.startTime;
						var curFrame = Math.round((scope.vs.curMousePosSample / scope.shs.wavJSO.SampleRate) / sInterv);

						var minX = Math.min.apply(Math, xCol.values);
						var maxX = Math.max.apply(Math, xCol.values);

						var minY = Math.min.apply(Math, yCol.values);
						var maxY = Math.max.apply(Math, yCol.values);

						if (minX < globalMinX) {
							globalMinX = minX;
						}
						if (maxX > globalMaxX) {
							globalMaxX = maxX;
						}
						if (minY < globalMinY) {
							globalMinY = minY;
						}
						if (maxY > globalMaxY) {
							globalMaxY = maxY;
						}

						console.log(xCol.values[curFrame]);
						console.log(yCol.values[curFrame]);

						var x = canvas.width - ((xCol.values[curFrame] - globalMinX) / (globalMaxX - globalMinX) * canvas.width);
						var y = ((yCol.values[curFrame] - globalMinY) / (globalMaxY - globalMinY) * canvas.height);


						var startPoint = (Math.PI / 180) * 0;
						var endPoint = (Math.PI / 180) * 360;
						ctx.beginPath();
						ctx.arc(x, y, 20, startPoint, endPoint, true);
						ctx.stroke();
						ctx.closePath();

						ctx.beginPath();
						ctx.arc(x, y, 2, startPoint, endPoint, true);
						ctx.fill();
						ctx.closePath();
					}

					// ctx.fillStyle = 'green';
					// ctx.strokeStyle = scope.cps.vals.colors.osciColor;
					// ctx.font = (scope.cps.vals.font.fontPxSize + 'px' + ' ' + scope.cps.vals.font.fontType);

					// var gridWidth = canvas.width / 8;
					// var gridHeight = canvas.height / 8;



					// var binValStrArr;
					// col.values[curFrame].forEach(function (el, elIdx) {
					// 	binValStrArr = el.toString(2).split('').reverse();
					// 	while (binValStrArr.length < 8) {
					// 		binValStrArr.push('0');
					// 	}

					// 	binValStrArr.forEach(function (binStr, binStrIdx) {
					// 		if (binStr === '1') {
					// 			ctx.fillStyle = 'grey';
					// 			ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
					// 		} else {
					// 			ctx.fillStyle = 'white';
					// 			ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
					// 		}
					// 	})
					// });

					// draw labels
					// var horizontalText = scope.fontImage.getTextImageTwoLines(ctx, 'DOTS', 'Frame:' + '???', scope.cps.vals.font.fontPxSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor, true);
					// ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, 0, horizontalText.width, horizontalText.height);
				}
			}
		};
	});