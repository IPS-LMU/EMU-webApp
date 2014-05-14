'use strict';


angular.module('emuwebApp')
	.directive('preview', function () {
		return {
			templateUrl: 'views/preview.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[1];
				// var myid = element[0].id;
				var initialized = false;
				// var cacheImage = new Image();


				/////////////////////
				// watches

				scope.$watch('vs.curViewPort', function (newVal, oldVal) {
					if (!$.isEmptyObject(scope.shs.wavJSO)) {
						if (oldVal.sS !== newVal.sS || oldVal.eS !== newVal.eS) {
							drawPreview();
						}
					}
				}, true);

				scope.$watch('shs.wavJSO', function () {
					if ($.isEmptyObject(scope.shs.wavJSO)) {
						var ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);

					}
				}, true);

				//
				/////////////////////

				/**
				 *
				 */
				function drawPreview() {
					if (!initialized) {
						// var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
						scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.cps);
						// cacheImage.src = canvas.toDataURL('image/png');
						initialized = true;
						drawVpOsciMarkup(scope.vs, canvas, scope.cps);
					} else {
						drawVpOsciMarkup(scope.vs, canvas, scope.cps);
					}
				}

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(vs, canvas, config, cacheImage) {
					var ctx = markupCanvas.getContext('2d');
					// var image = new Image();
					var posS = (markupCanvas.width / scope.shs.wavJSO.Data.length) * vs.curViewPort.sS;
					var posE = (markupCanvas.width / scope.shs.wavJSO.Data.length) * vs.curViewPort.eS;


					// var sDist = vs.getSampleDist(markupCanvas.width);
					// image.onload = function () {
					ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
					// ctx.drawImage(image, 0, 0);
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
					// };
					// image.src = cacheImage.src;
				}
			}
		};
	});