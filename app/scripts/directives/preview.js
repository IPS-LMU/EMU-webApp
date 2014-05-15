'use strict';


angular.module('emuwebApp')
	.directive('preview', function (viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService) {
		return {
			templateUrl: 'views/preview.html',
			restrict: 'E',
			scope: {
				currentBundleName: '@'
			},
			link: function postLink(scope, element) {
				// select the needed DOM elements from the template and init vals
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[1];
				var initialized = false;

				// hook up scope vars for watches
				scope.vs = viewState;
				scope.shs = Soundhandlerservice;


				/////////////////////
				// watches

				//
				scope.$watch('vs.curViewPort', function (newVal, oldVal) {
					if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
						if (oldVal.sS !== newVal.sS || oldVal.eS !== newVal.eS) {
							drawPreview();
						}
					}
				}, true);

				//
				scope.$watch('currentBundleName', function () {
					if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
						initialized = false;
						drawPreview();

					}
					//clear on empty bundle name
					if (scope.currentBundleName === '') {
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
						Drawhelperservice.freshRedrawDrawOsciOnCanvas(viewState, canvas, Drawhelperservice.osciPeaks, Soundhandlerservice.wavJSO.Data, ConfigProviderService);
						initialized = true;
						drawVpOsciMarkup(viewState, canvas, ConfigProviderService);
					} else {
						drawVpOsciMarkup(viewState, canvas, ConfigProviderService);
					}
				}

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */
				function drawVpOsciMarkup(vs, canvas, config) {
					var ctx = markupCanvas.getContext('2d');
					var posS = (markupCanvas.width / Soundhandlerservice.wavJSO.Data.length) * vs.curViewPort.sS;
					var posE = (markupCanvas.width / Soundhandlerservice.wavJSO.Data.length) * vs.curViewPort.eS;

					ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
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
				}
			}
		};
	});