import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('preview', function (ViewStateService, SoundHandlerService, DrawHelperService, ConfigProviderService) {
		return {
			template: `
			<div class="emuwebapp-preview">
			<canvas width="4096" height="128" class="emuwebapp-preview-canvas" ng-style="backgroundCanvas" id="PreviewCanvas"></canvas>
			<canvas width="4096" height="128" class="emuwebapp-preview-canvas-markup" id="PreviewCanvas" previewtrack></canvas>
			</div>
			`,
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
				scope.vs = ViewStateService;
				scope.shs = SoundHandlerService;
				scope.backgroundCanvas = {
					'background': '#000',
					'border': '1px solid gray',
					'width': '100%',
					'height': '100%'
				};

				/////////////////////
				// watches

				//
				scope.$watch('vs.curViewPort', function (newVal, oldVal) {
					if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
						if (oldVal.sS !== newVal.sS || oldVal.eS !== newVal.eS) {
							scope.drawPreview();
						}
					}
				}, true);

				//
				scope.$watch('vs.osciSettings', function () {
					if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
						initialized = false; // reset to uninitialized when channels change
						scope.drawPreview();
					}
				}, true);

				//
				scope.$watch('currentBundleName', function () {
					if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
						initialized = false;
						scope.backgroundCanvas = {
							'background': ConfigProviderService.design.color.black,
							'border': '1px solid gray',
							'width': '100%',
							'height': '100%'
						};
						scope.drawPreview();

					}
					//clear on empty bundle name
					if (scope.currentBundleName === '') {
						var ctx = canvas.getContext('2d');
						var ctxMarkup = markupCanvas.getContext('2d');
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctxMarkup.clearRect(0, 0, canvas.width, canvas.height);
					}
				}, true);

				//
				/////////////////////

				/**
				 *
				 */
				scope.drawPreview = function () {
					if (!initialized) {
						DrawHelperService.freshRedrawDrawOsciOnCanvas(canvas, 0, scope.shs.audioBuffer.length, false);
						initialized = true;
						scope.drawVpOsciMarkup(ViewStateService);
					} else {
						scope.drawVpOsciMarkup(ViewStateService);
					}
				};

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */
				scope.drawVpOsciMarkup = function (vs) {
					var ctx = markupCanvas.getContext('2d');
					var posS = (markupCanvas.width / SoundHandlerService.audioBuffer.length) * vs.curViewPort.sS;
					var posE = (markupCanvas.width / SoundHandlerService.audioBuffer.length) * vs.curViewPort.eS;

					ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
					ctx.fillStyle = ConfigProviderService.design.color.transparent.lightGrey;
					ctx.fillRect(posS, 0, posE - posS, markupCanvas.height);
					ctx.strokeStyle = ConfigProviderService.design.color.white;
					ctx.beginPath();
					ctx.moveTo(posS, 0);
					ctx.lineTo(posS, markupCanvas.height);
					ctx.moveTo(posE, 0);
					ctx.lineTo(posE, markupCanvas.height);
					ctx.closePath();
					ctx.stroke();
				};
			}
		};
	});
