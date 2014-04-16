'use strict';

angular.module('emuwebApp')
	.directive('dots', function (viewState) {
		return {
			template: '<div class="twoDimCanvasContainer"><canvas width="512" height="512"></canvas></div>',
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

				scope.$watch('ssffds.data.length', function () {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawDots(scope);
							}
						}
					}
				}, true);

				scope.$watch('vs.curViewPort', function () {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawDots(scope);
							}
						}
					}
				}, true);

				scope.$watch('vs.curMousePosSample', function () {
					if (!$.isEmptyObject(scope.cps.vals)) {
						if (!$.isEmptyObject(scope.ssffds.data)) {
							if (scope.ssffds.data.length !== 0) {
								drawDots(scope);
							}
						}
					}
				}, true);

				function setGlobalMinMaxVals() {
					// body...
					var dD = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0]; // SIC SIC SIC hardcoded
					for (var i = 0; i < dD.dots.length; i++) {
						// get xCol
						var trConf = scope.cps.getSsffTrackConfig(dD.dots[i].xSsffTrack);
						var xCol = scope.ssffds.getColumnOfTrack(trConf.name, trConf.columnName);
						if (xCol._minVal < globalMinX) {
							globalMinX = xCol._minVal;
						}
						if (xCol._maxVal > globalMaxX) {
							globalMaxX = xCol._maxVal;
						}

						// get yCol
						trConf = scope.cps.getSsffTrackConfig(dD.dots[i].ySsffTrack);
						var yCol = scope.ssffds.getColumnOfTrack(trConf.name, trConf.columnName);
						if (yCol._minVal < globalMinY) {
							globalMinY = yCol._minVal;
						}
						if (yCol._maxVal > globalMaxY) {
							globalMaxY = yCol._maxVal;
						}
					}
				}

				function getScale(ctx, str, scale) {
					return ctx.measureText(str).width * scale;
				}

				function getScaleWidth(ctx, str1, str2, scaleX) {
					if (str1.toString().length > str2.toString().length) {
						return getScale(ctx, str1, scaleX);
					} else {
						return getScale(ctx, str2, scaleX);
					}
				}


				/**
				 * drawing method to drawDots
				 */
				function drawDots() {
					if (globalMinX === Infinity) {
						setGlobalMinMaxVals();
					}

					var ctx = canvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					//////////////////////////////
					// markup to improve visualization 

					var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
					var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					// draw corner pointers
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(5, 5);
					ctx.moveTo(0, canvas.height);
					ctx.lineTo(5, canvas.height - 5);
					ctx.moveTo(canvas.width, canvas.height);
					ctx.lineTo(canvas.width - 5, canvas.height - 5);
					ctx.stroke();
					ctx.closePath();

					var smallFontSize = scope.cps.vals.font.fontPxSize * 3 / 4;
					// ymax
					var labelTxtImg = scope.fontImage.getTextImage(ctx, 'yMax: ' + scope.vs.round(globalMaxY, 2), smallFontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
					ctx.drawImage(labelTxtImg, 5, 5, labelTxtImg.width, labelTxtImg.height);

					// xmin + y min
					labelTxtImg = scope.fontImage.getTextImageTwoLines(ctx, 'yMin: ' + scope.vs.round(globalMinY, 2), 'xMin: ' + scope.vs.round(globalMinX, 2), smallFontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor, true);
					ctx.drawImage(labelTxtImg, 5, canvas.height - smallFontSize * scaleY * 2 - 5, labelTxtImg.width, labelTxtImg.height);

					// xmax
					var tw = ctx.measureText('xMax: ' + scope.vs.round(globalMaxX, 5)).width * scaleX; // SIC why 5???
					labelTxtImg = scope.fontImage.getTextImage(ctx, 'xMax: ' + scope.vs.round(globalMaxX, 2), smallFontSize, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
					ctx.drawImage(labelTxtImg, canvas.width - tw - 5, canvas.height - smallFontSize * scaleY - 5, labelTxtImg.width, labelTxtImg.height);

					var dD = scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0]; // SIC SIC SIC hardcoded

					// frame nr
					var xsRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(dD.dots[0].xSsffTrack); // use first track for sample numbers
					var ysRaSt = scope.ssffds.getSampleRateAndStartTimeOfTrack(dD.dots[0].ySsffTrack);

					var sInterv = 1 / xsRaSt.sampleRate - xsRaSt.startTime;
					var curFrame = Math.round((scope.vs.curMousePosSample / scope.shs.wavJSO.SampleRate) / sInterv);


					tw = ctx.measureText('frame: ' + curFrame).width * scaleX;
					labelTxtImg = scope.fontImage.getTextImage(ctx, 'frame: ' + curFrame, scope.cps.vals.font.fontPxSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.endBoundaryColor);
					var degrees = 90;
					ctx.save();
					ctx.rotate(degrees * Math.PI / 180);
					ctx.drawImage(labelTxtImg, canvas.width / 2 - tw / 2, -canvas.height);
					ctx.restore();

					//////////////////////////////
					// draw dots


					var allDots = [];

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

						// 
						// var minX = Math.min.apply(Math, xCol.values);
						// var maxX = Math.max.apply(Math, xCol.values);

						// var minY = Math.min.apply(Math, yCol.values);
						// var maxY = Math.max.apply(Math, yCol.values);

						// if (minX < globalMinX) {
						// 	globalMinX = minX;
						// }
						// if (maxX > globalMaxX) {
						// 	globalMaxX = maxX;
						// }
						// if (minY < globalMinY) {
						// 	globalMinY = minY;
						// }
						// if (maxY > globalMaxY) {
						// 	globalMaxY = maxY;
						// }

						// console.log(xCol.values[curFrame]);
						// console.log(yCol.values[curFrame]);

						var x = ((xCol.values[curFrame] - globalMinX) / (globalMaxX - globalMinX) * canvas.width);
						var y = canvas.height - ((yCol.values[curFrame] - globalMinY) / (globalMaxY - globalMinY) * canvas.height);


						var startPoint = (Math.PI / 180) * 0;
						var endPoint = (Math.PI / 180) * 360;
						ctx.strokeStyle = dD.dots[i].color;
						ctx.beginPath();
						ctx.arc(x, y, 20, startPoint, endPoint, true);
						ctx.stroke();
						ctx.closePath();

						ctx.beginPath();
						ctx.arc(x, y, 2, startPoint, endPoint, true);
						ctx.fill();
						ctx.closePath();

						// draw labels
						var labelTxtImg = scope.fontImage.getTextImage(ctx, dD.dots[i].name, scope.cps.vals.font.fontPxSize - 4, scope.cps.vals.font.fontType, scope.cps.vals.colors.labelColor);
						ctx.drawImage(labelTxtImg, x, y - 5, labelTxtImg.width, labelTxtImg.height);



						// append to all dots
						allDots.push({
							'name': dD.dots[i].name,
							'x': x,
							'y': y
						});

					}

					var f, t;
					dD.connectLines.forEach(function (c) {
						allDots.forEach(function (d) {
							if (d.name === c.fromDot) {
								f = d;
							}
							if (d.name === c.toDot) {
								t = d;
							}
						});

						// draw line
						ctx.strokeStyle = c.color;
						ctx.beginPath();
						ctx.moveTo(f.x, f.y);
						ctx.lineTo(t.x, t.y);
						ctx.stroke();
						ctx.closePath();
					});

				}
			}
		};
	});