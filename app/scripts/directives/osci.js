'use strict';


angular.module('emuwebApp')
	.directive('osci', function (viewState) {
		return {
			templateUrl: 'views/osci.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs) {


				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[canvasLength - 1];
				scope.order = attrs.order;

				scope.enlargeCanvas = {
					'height': 100 / scope.cps.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length + '%'
				};

				scope.$watch('cps.vals.perspectives', function () {
					scope.updateCSS();
				}, true);

				scope.$watch('vs.playHeadAnimationInfos', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawPlayHead(scope, scope.cps);
						}
					}
				}, true);

				scope.$watch('tds.data', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.cps, true);
						}
					}
				}, true);

				scope.$watch('vs.movingBoundary', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.cps, true);
						}
					}
				}, true);

				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.sE !== newValue.sE || newValue.selectS === -1) { // SIC -1 check not that clean...
								var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
								scope.dhs.osciPeaks = allPeakVals;
								scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.cps);
							}
							drawVpOsciMarkup(scope, scope.cps, true);
							scope.updateCSS();
						}
					}
				}, true);


				scope.updateCSS = function () {
					var parts = scope.cps.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
					if (viewState.getenlarge() == -1) {
						scope.enlargeCanvas = {
							'height': 100 / parts + '%'
						};
					} else {
						if (viewState.getenlarge() == scope.order) {
							scope.enlargeCanvas = {
								'height': 3 * 100 / (parts + 2) + '%'
							};
						} else {
							scope.enlargeCanvas = {
								'height': 100 / (parts + 2) + '%'
							};
						}
					}
				};

				/**
				 *
				 */

				function drawPlayHead(scope, config) {
					var viewState = scope.vs;
					var ctx = markupCanvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					var posS = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.sS);
					var posCur = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.curS);
					// console.log(viewState.playHeadAnimationInfos.curS)

					ctx.fillStyle = scope.cps.vals.colors.selectedAreaColor;
					ctx.fillRect(posS, 0, posCur - posS, canvas.height);

					//console.log(posS,posCur);

					drawVpOsciMarkup(scope, config, false);

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
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(scope, config, reset) {

					var viewState = scope.vs;
					var ctx = markupCanvas.getContext('2d');
					if (reset) {
						ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
					}

					var xOffset, sDist;
					sDist = viewState.getSampleDist(markupCanvas.width);

					// draw moving boundary line if moving
					scope.dhs.drawMovingBoundaryLine(ctx);

					// draw current viewport selected
					scope.dhs.drawCurViewPortSelected(ctx, true);

					ctx.strokeStyle = config.vals.colors.labelColor;
					ctx.fillStyle = config.vals.colors.labelColor;
					ctx.font = (config.vals.font.fontPxSize + 'px' + ' ' + config.vals.font.fontType);

					// lines to corners
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(5, 5);
					ctx.moveTo(markupCanvas.width, 0);
					ctx.lineTo(markupCanvas.width - 5, 5);
					ctx.closePath();
					ctx.stroke();

					var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
					// var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					var sTime;
					var eTime;
					var horizontalText;
					var space;

					if (viewState.curViewPort) {
						//draw time and sample nr

						sTime = viewState.round(viewState.curViewPort.sS / scope.shs.wavJSO.SampleRate, 6);
						eTime = viewState.round(viewState.curViewPort.eS / scope.shs.wavJSO.SampleRate, 6);

						horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.sS, sTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, 0, horizontalText.width, horizontalText.height);

						space = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
						horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.eS, eTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, markupCanvas.width - space - 5, 0, horizontalText.width, horizontalText.height);

					}
				}
			}
		};
	});