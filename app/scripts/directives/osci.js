'use strict';


angular.module('emuwebApp')
	.directive('osci', function (ConfigProviderService, viewState) {
		return {
			templateUrl: 'views/osci.html',
			replace: true,
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
			    scope.order = attrs.order;
			    scope.enlargeCanvas = {'height': 100/ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length +'%', 'top': 100/ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length * scope.order+'%'};
				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[canvasLength - 1];
				

				scope.$watch('vs.playHeadAnimationInfos', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawPlayHead(scope, scope.config);
						}
					}
				}, true);

				scope.$watch('tds.data', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$watch('vs.movingBoundary', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$on('refreshTimeline', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							drawVpOsciMarkup(scope, scope.config, true);
						} else {
							var ctx = canvas.getContext('2d');
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx = markupCanvas.getContext('2d');
							ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
						}
					}
				});

				scope.$watch('vs.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.sE !== newValue.sE || newValue.selectS === -1) { // SIC -1 check not that clean...
								var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
								scope.dhs.osciPeaks = allPeakVals;
								scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.config);
							}
							drawVpOsciMarkup(scope, scope.config, true);
						}
					}
				}, true);

				scope.$watch('vs.scrollOpen', function () {
					if (!$.isEmptyObject(scope.config)) {
						if (!$.isEmptyObject(scope.config.vals)) {
							var per = scope.config.vals.main.osciSpectroZoomFactor * 10;
							var perInvers = 100 - (scope.config.vals.main.osciSpectroZoomFactor * 10);
							if (scope.vs.scrollOpen === 0) {
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
							} else if (scope.vs.scrollOpen === 1) {
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
							} else if (scope.vs.scrollOpen === 2) {
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