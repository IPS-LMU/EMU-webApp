'use strict';


angular.module('emulvcApp')
	.directive('osci', function() {
		return {
			templateUrl: 'views/osci.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[canvasLength - 1];


				scope.$watch('vs.playHeadAnimationInfos', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawPlayHead(scope, scope.config);
						}
					}
				}, true);

				scope.$watch('tds.data', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$watch('vs.movingBoundary', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$on('refreshTimeline', function() {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				});

				scope.$watch('vs.curViewPort', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							// check for changed zoom
							if (oldValue.sS != newValue.sS || oldValue.sE != newValue.sE || newValue.selectS == -1) { // SIC -1 check not that clean...
								var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
								scope.dhs.osciPeaks = allPeakVals;
								scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.config);
							}
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$watch('vs.scrollOpen', function() {
					if (!$.isEmptyObject(scope.config)) {
						if (!$.isEmptyObject(scope.config.vals)) {
							var per = scope.config.vals.main.osciSpectroZoomFactor * 10;
							var perInvers = 100 - (scope.config.vals.main.osciSpectroZoomFactor * 10);
							if (scope.vs.scrollOpen == 0) {
								$('.OsciDiv').css({
									height: '50%'
								});
								$('.OsciDiv canvas').css({
									height: '48%'
								});
								$('.SpectroDiv').css({
									height: '50%'
								});
								$('.SpectroDiv canvas').css({
									height: '48%'
								});
							} else if (scope.vs.scrollOpen == 1) {
								$('.OsciDiv').css({
									height: per + '%'
								});
								$('.OsciDiv canvas').css({
									height: per + '%'
								});
								$('.SpectroDiv').css({
									height: perInvers + '%'
								});
								$('.SpectroDiv canvas').css({
									height: perInvers + '%'
								});
							} else if (scope.vs.scrollOpen == 2) {
								$('.OsciDiv').css({
									height: perInvers + '%'
								});
								$('.OsciDiv canvas').css({
									height: perInvers + '%'
								});
								$('.SpectroDiv').css({
									height: per + '%'
								});
								$('.SpectroDiv canvas').css({
									height: per + '%'
								});
							}
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

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

					ctx.fillStyle = scope.config.vals.colors.selectedAreaColor;
					ctx.fillRect(posS, 0, posCur - posS, canvas.height);

					//console.log(posS,posCur);

					drawVpOsciMarkup(scope, config, false);

				};

				function getScale(ctx, str, scale) {
					return ctx.measureText(str).width * scale;
				};

				function getScaleWidth(ctx, str1, str2, scaleX) {
					if (str1.toString().length > str2.toString().length) {
						return getScale(ctx, str1, scaleX);
					} else {
						return getScale(ctx, str2, scaleX);
					}
				};

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

					// draw boundary moving line
					if(viewState.movingBoundary){
						ctx.fillStyle = config.vals.colors.selectedBoundaryColor;
						var tD = viewState.getcurMouseTierDetails();
						var p = Math.round(viewState.getPos(markupCanvas.width, tD.events[viewState.getcurMouseSegmentId()].startSample));
						ctx.fillRect(p, 0, 1, markupCanvas.height);
					};


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
					var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					var sTime;
					var eTime;
					var horizontalText;

					if (viewState.curViewPort) {
						//draw time and sample nr

						sTime = viewState.round(viewState.curViewPort.sS / scope.shs.wavJSO.SampleRate, 6);
						eTime = viewState.round(viewState.curViewPort.eS / scope.shs.wavJSO.SampleRate, 6);

						horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.sS, sTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, 0, horizontalText.width, horizontalText.height);

						var space = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
						horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.eS, eTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, markupCanvas.width - space - 5, 0, horizontalText.width, horizontalText.height);

					}
					//draw emulabeller.viewPortselected
					if (viewState.curViewPort.selectS !== -1 && viewState.curViewPort.selectE !== -1) {
						var posS = viewState.getPos(markupCanvas.width, viewState.curViewPort.selectS);
						var posE = viewState.getPos(markupCanvas.width, viewState.curViewPort.selectE);
						var sDist = viewState.getSampleDist(markupCanvas.width);
						var xOffset;
						if (viewState.curViewPort.selectS === viewState.curViewPort.selectE) {
							// calc. offset dependant on type of tier of mousemove  -> default is sample exact
							if (viewState.curMouseMoveTierType === 'seg') {
								xOffset = 0;
							} else {
								xOffset = (sDist / 2);
							}
							ctx.fillStyle = config.vals.colors.selectedBorderColor;
							ctx.fillRect(posS + xOffset, 0, 1, markupCanvas.height);

							horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate + (1 / scope.shs.wavJSO.SampleRate) / 2, 6), viewState.curViewPort.selectS, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
							ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posS + xOffset + 5, 0, horizontalText.width, horizontalText.height);


						} else {
							ctx.fillStyle = config.vals.colors.selectedAreaColor;
							ctx.fillRect(posS, 0, posE - posS, markupCanvas.height);
							ctx.strokeStyle = config.vals.colors.selectedBorderColor;
							ctx.beginPath();
							ctx.moveTo(posS, 0);
							ctx.lineTo(posS, markupCanvas.height);
							ctx.moveTo(posE, 0);
							ctx.lineTo(posE, markupCanvas.height);
							ctx.closePath();
							ctx.stroke();
							ctx.fillStyle = config.vals.colors.labelColor;
							// start values
							var space = getScaleWidth(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate, 6), scaleX);
							horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate, 6), config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
							ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posS - space - 5, 0, horizontalText.width, horizontalText.height);

							// end values
							horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.selectE, viewState.round(viewState.curViewPort.selectE / scope.shs.wavJSO.SampleRate, 6), config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
							ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posE + 5, 0, horizontalText.width, horizontalText.height);
							// dur values
							// check if space

							space = getScale(ctx, viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / scope.shs.wavJSO.SampleRate, 6), scaleX);

							if (posE - posS > space) {
								var str1 = viewState.curViewPort.selectE - viewState.curViewPort.selectS - 1;
								var str2 = viewState.round(((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / scope.shs.wavJSO.SampleRate), 6);

								var space = getScaleWidth(ctx, str1, str2, scaleX);
								horizontalText = scope.fontImage.getTextImageTwoLines(ctx, str1, str2, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
								ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posS + (posE - posS) / 2 - space / 2, 0, horizontalText.width, horizontalText.height);


							}
						}
					}
				}
			}
		};
	});