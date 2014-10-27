'use strict';


angular.module('emuwebApp')
	.directive('osci', function ($timeout, viewState, Soundhandlerservice, ConfigProviderService, Drawhelperservice) {
		return {
			templateUrl: 'views/osci.html',
			replace: true,
			restrict: 'E',
			scope: {},
			controller: function ($scope) {
				$scope.changeAttrDef = function(){
					alert('sadf');
				};

			},
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var canvas = element.find('canvas')[0];
				var markupCanvas = element.find('canvas')[canvasLength - 1];
				// assign attributes to scope
				scope.order = attrs.order;
				scope.trackName = attrs.trackName;
				scope.cps = ConfigProviderService;
				scope.viewState = viewState;

				///////////////
				// watches

				// on broadcast msg from main ctrl openSubmenu refresh timeline
				scope.$on('refreshTimeline', function () {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				});

				//
				scope.$watch('viewState.timelineSize', function () {
					$timeout(scope.redraw, 10);
				});

				//
				scope.$watch('viewState.curPerspectiveIdx', function () {
					drawVpOsciMarkup(scope, ConfigProviderService, true);
				}, true);

				//
				scope.$watch('viewState.playHeadAnimationInfos', function () {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawPlayHead(scope, ConfigProviderService);
						}
					}
				}, true);

				//
				scope.$watch('viewState.movingBoundarySample', function (newValue) {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				//
				scope.$watch('viewState.movingBoundary', function () {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				//
				scope.$watch('viewState.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(Soundhandlerservice)) {
						if (!$.isEmptyObject(Soundhandlerservice.wavJSO)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
								var allPeakVals = Drawhelperservice.calculatePeaks(viewState, canvas, Soundhandlerservice.wavJSO.Data);
								Drawhelperservice.osciPeaks = allPeakVals;
								Drawhelperservice.freshRedrawDrawOsciOnCanvas(viewState, canvas, Drawhelperservice.osciPeaks, Soundhandlerservice.wavJSO.Data, ConfigProviderService);
							}
							drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				//
				/////////////////////////

				scope.redraw = function () {
					drawVpOsciMarkup(scope, ConfigProviderService, true)
				};


				/**
				 *
				 */
				function drawPlayHead(scope, config) {
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

					// draw moving boundary line if moving
					Drawhelperservice.drawMovingBoundaryLine(ctx);

					Drawhelperservice.drawViewPortTimes(ctx, true);
					// draw current viewport selected
					Drawhelperservice.drawCurViewPortSelected(ctx, true);
				}
			}
		};
	});