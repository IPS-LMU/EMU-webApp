'use strict';


angular.module('emuwebApp')
	.directive('preview', function () {
		return {
			templateUrl: 'views/preview.html',
			restrict: 'E',
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template
				var canvas = element.find('canvas')[0];
				// var myid = element[0].id;
				var initialized = false;
				var cacheImage = new Image();

				scope.$watch('vs.curViewPort', function () {
					if (!$.isEmptyObject(scope.shs.wavJSO)) {
						drawPreview();
					}
				}, true);

				scope.$watch('shs.wavJSO', function () {
					if ($.isEmptyObject(scope.shs.wavJSO)) {
						var ctx = canvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);

					}
				}, true);

				// scope.$on('cleanPreview', function () {
				// 	initialized = false;
				// });

				function drawPreview() {
					if (!initialized) {
						// var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.wavJSO.Data);
						scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.wavJSO.Data, scope.config);
						cacheImage.src = canvas.toDataURL('image/png');
						initialized = true;
						drawVpOsciMarkup(scope.vs, canvas, scope.config, cacheImage);
					} else {
						drawVpOsciMarkup(scope.vs, canvas, scope.config, cacheImage);
					}
				}

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(vs, canvas, config, cacheImage) {
					var ctx = canvas.getContext('2d');
					var image = new Image();
					var posS = (canvas.width / scope.shs.wavJSO.Data.length) * vs.curViewPort.sS;
					var posE = (canvas.width / scope.shs.wavJSO.Data.length) * vs.curViewPort.eS;
					// var sDist = vs.getSampleDist(canvas.width);
					image.onload = function () {
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(image, 0, 0);
						ctx.fillStyle = config.vals.colors.selectedAreaColor;
						ctx.fillRect(posS, 0, posE - posS, canvas.height);
						ctx.strokeStyle = config.vals.colors.selectedBorderColor;
						ctx.beginPath();
						ctx.moveTo(posS, 0);
						ctx.lineTo(posS, canvas.height);
						ctx.moveTo(posE, 0);
						ctx.lineTo(posE, canvas.height);
						ctx.closePath();
						ctx.stroke();
					};
					image.src = cacheImage.src;
				}
			}
		};
	});