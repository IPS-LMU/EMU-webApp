'use strict';


angular.module('emulvcApp')
	.directive('osci', function() {
		return {
			templateUrl: 'views/osci.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[1];

				// var playHeadAnimDur = 0;
				// var setIntervalID;
				// var viewState = scope.vs;

				console.log(scope.shs);

				scope.$watch('vs.playHeadAnimationInfos', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs.wavJSO)) {
						drawPlayHead(scope, scope.config);
					}
				}, true);

				scope.$watch('vs.curViewPort', function(newValue, oldValue) {

					if (!$.isEmptyObject(scope.shs.wavJSO)) {
						// check for changed zoom
						if (oldValue.sS != newValue.sS || oldValue.sE != newValue.sE || newValue.selectS == -1) { // SIC -1 check not that clean...
							var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
							scope.dhs.osciPeaks = allPeakVals;
							scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.config);
						}
						drawVpOsciMarkup(scope, scope.config);
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

					ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
					ctx.fillRect(posS , 0, posCur, canvas.height);

					// drawVpOsciMarkup(scope, config);

				};

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(scope, config) {

					var viewState = scope.vs;
					var ctx = markupCanvas.getContext('2d');
					ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);

					ctx.strokeStyle = config.vals.colors.labelColor;
					ctx.fillStyle = config.vals.colors.labelColor;
					ctx.font = (config.vals.colors.fontPxSize + 'px' + ' ' + config.vals.colors.fontType);

					// lines to corners
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(5, 5);
					ctx.moveTo(markupCanvas.width, 0);
					ctx.lineTo(markupCanvas.width - 5, 5);
					ctx.closePath();
					ctx.stroke();

					var sTime;
					var eTime;
					if (viewState.curViewPort) {
						//draw time and sample nr
						sTime = viewState.round(viewState.curViewPort.sS / scope.shs.wavJSO.SampleRate, 6);
						eTime = viewState.round(viewState.curViewPort.eS / scope.shs.wavJSO.SampleRate, 6);
						ctx.fillText(viewState.curViewPort.sS, 5, config.vals.colors.fontPxSize);
						ctx.fillText(sTime, 5, config.vals.colors.fontPxSize * 2);
						var metrics = ctx.measureText(sTime);
						ctx.fillText(viewState.curViewPort.eS, markupCanvas.width - ctx.measureText(viewState.curViewPort.eS).width - 5, config.vals.colors.fontPxSize);
						ctx.fillText(eTime, markupCanvas.width - metrics.width - 5, config.vals.colors.fontPxSize * 2);
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
							ctx.fillStyle = config.vals.colors.labelColor;
							ctx.fillText(viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate + (1 / scope.shs.wavJSO.SampleRate) / 2, 6), posS + xOffset + 5, config.vals.colors.fontPxSize);
							ctx.fillText(viewState.curViewPort.selectS, posS + xOffset + 5, config.vals.colors.fontPxSize * 2);
						} else {
							ctx.fillStyle = config.vals.colors.selectedAreaColor;
							ctx.fillRect(posS, 0, posE - posS, markupCanvas.height);
							ctx.strokeStyle = config.vals.colors.selectedBoundaryColor;
							ctx.beginPath();
							ctx.moveTo(posS, 0);
							ctx.lineTo(posS, markupCanvas.height);
							ctx.moveTo(posE, 0);
							ctx.lineTo(posE, markupCanvas.height);
							ctx.closePath();
							ctx.stroke();
							ctx.fillStyle = config.vals.colors.labelColor;
							// start values
							var tW = ctx.measureText(viewState.curViewPort.selectS).width;
							ctx.fillText(viewState.curViewPort.selectS, posS - tW - 4, config.vals.colors.fontPxSize);
							tW = ctx.measureText(viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate, 6)).width;
							ctx.fillText(viewState.round(viewState.curViewPort.selectS / scope.shs.wavJSO.SampleRate, 6), posS - tW - 4, config.vals.colors.fontPxSize * 2);
							// end values
							ctx.fillText(viewState.curViewPort.selectE, posE + 5, config.vals.colors.fontPxSize);
							ctx.fillText(viewState.round(viewState.curViewPort.selectE / scope.shs.wavJSO.SampleRate, 6), posE + 5, config.vals.colors.fontPxSize * 2);
							// dur values
							// check if space
							if (posE - posS > ctx.measureText(viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / scope.shs.wavJSO.SampleRate, 6)).width) {
								tW = ctx.measureText(viewState.curViewPort.selectE - viewState.curViewPort.selectS).width;
								ctx.fillText(viewState.curViewPort.selectE - viewState.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, config.vals.colors.fontPxSize);
								tW = ctx.measureText(viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / scope.shs.wavJSO.SampleRate, 6)).width;
								ctx.fillText(viewState.round(((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / scope.shs.wavJSO.SampleRate), 6), posS + (posE - posS) / 2 - tW / 2, config.vals.colors.fontPxSize * 2);
							}
						}
					}
				}
			}
		};
	});