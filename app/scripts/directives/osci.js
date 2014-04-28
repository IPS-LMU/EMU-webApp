'use strict';


angular.module('emuwebApp')
	.directive('osci', function (viewState, Soundhandlerservice, ConfigProviderService, Drawhelperservice) {
		return {
			templateUrl: 'views/osci.html',
			replace: true,
			restrict: 'E',
			// scope: {},
			link: function postLink(scope, element, attrs) {


				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[canvasLength - 1];
				scope.order = attrs.order;

				scope.enlargeCanvas = {
					'height': 100 / ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length + '%'
				};

				scope.cpi = viewState.curPerspectiveIdx;
				scope.phai = viewState.playHeadAnimationInfos;
				scope.cvp = viewState.curViewPort;
				scope.mb = viewState.movingBoundary;

				///////////////
				// watches

				scope.$watch('cpi', function () {
					scope.updateCSS();
				}, true);

				scope.$watch('phai', function () {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawPlayHead(scope, ConfigProviderService);
						}
					}
				}, true);

				// scope.$watch('tds.data', function () {
				// 	if (!$.isEmptyObject(Soundhandlerservice)) {
				// 		if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
				// 			console.log(scope.tds.data)
				// 			drawVpOsciMarkup(scope, ConfigProviderService, true);
				// 		}
				// 	}
				// }, true);

				scope.$watch('mb', function () {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				scope.$watch('cvp', function (newValue, oldValue) {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.sE !== newValue.sE || newValue.selectS === -1) { // SIC -1 check not that clean...
								var allPeakVals = Drawhelperservice.calculatePeaks(viewState, canvas, Soundhandlerservice.wavJSO.Data);
								Drawhelperservice.osciPeaks = allPeakVals;
								Drawhelperservice.freshRedrawDrawOsciOnCanvas(viewState, canvas, Drawhelperservice.osciPeaks, Soundhandlerservice.wavJSO.Data, ConfigProviderService);
							}
							drawVpOsciMarkup(scope, ConfigProviderService, true);
							scope.updateCSS();
						}
					}
				}, true);

				//
				/////////////////////////

				/**
				 *
				 */
				scope.redraw = function () {
					drawVpOsciMarkup(scope, ConfigProviderService, true);
					scope.updateCSS();
				};

				/**
				 *
				 */
				scope.updateCSS = function () {
					var parts = ConfigProviderService.vals.perspectives[viewState.curPerspectiveIdx].signalCanvases.order.length;
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
					var viewState = viewState;
					var ctx = markupCanvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					var posS = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.sS);
					var posCur = viewState.getPos(markupCanvas.width, viewState.playHeadAnimationInfos.curS);
					// console.log(viewState.playHeadAnimationInfos.curS)

					ctx.fillStyle = ConfigProviderService.vals.colors.selectedAreaColor;
					ctx.fillRect(posS, 0, posCur - posS, canvas.height);

					//console.log(posS,posCur);

					drawVpOsciMarkup(scope, config, false);

				}

				function getScaleW(ctx, str, scale) {
					return ctx.measureText(str).width * scale;
				}

				function getScaleH(ctx, str, scale) {
					return ctx.measureText(str).width * scale;
				}

				function getScaleWidth(ctx, str1, str2, scaleX) {
					if (str1.toString().length > str2.toString().length) {
						return getScaleW(ctx, str1, scaleX);
					} else {
						return getScaleW(ctx, str2, scaleX);
					}
				}

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(scope, config, reset) {

					var ctx = markupCanvas.getContext('2d');
					if (reset) {
						ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
					}

					var xOffset, sDist;
					sDist = viewState.getSampleDist(markupCanvas.width);

					// draw moving boundary line if moving
					Drawhelperservice.drawMovingBoundaryLine(ctx);

					// draw current viewport selected
					Drawhelperservice.drawCurViewPortSelected(ctx, true);

					// draw view port times
					Drawhelperservice.drawViewPortTimes(ctx, true);

					// ctx.strokeStyle = config.vals.colors.labelColor;
					// ctx.fillStyle = config.vals.colors.labelColor;
					// ctx.font = (config.vals.font.fontPxSize + 'px' + ' ' + config.vals.font.fontType);

					// // lines to corners
					// ctx.beginPath();
					// ctx.moveTo(0, 0);
					// ctx.lineTo(5, 5);
					// ctx.moveTo(markupCanvas.width, 0);
					// ctx.lineTo(markupCanvas.width - 5, 5);
					// ctx.closePath();
					// ctx.stroke();

					// var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
					// var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

					// var sTime;
					// var eTime;
					// var horizontalText;
					// var space;

					// if (viewState.curViewPort) {
					// 	//draw time and sample nr

					// 	sTime = viewState.round(viewState.curViewPort.sS / Soundhandlerservice.wavJSO.SampleRate, 6);
					// 	eTime = viewState.round(viewState.curViewPort.eS / Soundhandlerservice.wavJSO.SampleRate, 6);

					// 	horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.sS, sTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, true);
					// 	// ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 0, 0, horizontalText.width, horizontalText.height);
					// 	ctx.drawImage(horizontalText, 5, 5);

					// 	space = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
					// 	horizontalText = scope.fontImage.getTextImageTwoLines(ctx, viewState.curViewPort.eS, eTime, config.vals.font.fontPxSize, config.vals.font.fontType, config.vals.colors.labelColor, false);
					// 	ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, markupCanvas.width - space - 5, 0, horizontalText.width, horizontalText.height);


					// 	//draw dot at edge of image
					// 	// var spaceW = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
					// 	// var startPoint = (Math.PI / 180) * 0;
					// 	// var endPoint = (Math.PI / 180) * 360;
					// 	// ctx.beginPath();
					// 	// ctx.arc(spaceW, config.vals.font.fontPxSize * 2 * scaleY, 10, startPoint, endPoint, true);
					// 	// ctx.fill();
					// 	// ctx.closePath();


					// }
				}
			}
		};
	});