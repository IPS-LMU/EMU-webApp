import * as angular from 'angular';

angular.module('emuwebApp')
	.directive('osci', function ($timeout, ViewStateService, SoundHandlerService, ConfigProviderService, DrawHelperService, LoadedMetaDataService) {
		return {
			templateUrl: 'views/osci.html',
			replace: true,
			restrict: 'E',
			scope: {},
			controller: function ($scope) {
				$scope.changeAttrDef = function () {
					//alert('sadf');
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
				scope.ViewStateService = ViewStateService;
				scope.lmds = LoadedMetaDataService;

				///////////////
				// watches

				//
				scope.$watch('ViewStateService.osciSettings', function () {
					if(ViewStateService.osciSettings.invert){
						canvas.style.background = ConfigProviderService.design.color.white; 
					} else {
						canvas.style.background = ConfigProviderService.design.color.black; 
					}
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							DrawHelperService.freshRedrawDrawOsciOnCanvas(canvas, ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS, false);
							scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}

				}, true);


				//
				scope.$watch('ViewStateService.lastUpdate', function (newValue, oldValue) {
					if (newValue !== oldValue) {
						scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
					}
				});

				//
				scope.$watch('ViewStateService.timelineSize', function () {
					$timeout(scope.redraw, ConfigProviderService.design.animation.duration);
				});

				//
				scope.$watch('ViewStateService.curPerspectiveIdx', function () {
					scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
				}, true);

				//
				scope.$watch('ViewStateService.playHeadAnimationInfos', function () {
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							scope.drawPlayHead(scope, ConfigProviderService);
						}
					}
				}, true);

				//
				scope.$watch('ViewStateService.movingBoundarySample', function () {
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

                //
                scope.$watch('ViewStateService.curMouseX', function () {
                    if (!$.isEmptyObject(SoundHandlerService)) {
                        if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
                            // only draw corsshair x line if mouse currently not over canvas
                            if(ViewStateService.curMouseTrackName !== scope.trackName) {
                                scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
                            }
                        }
                    }
                }, true);

                //
				scope.$watch('ViewStateService.movingBoundary', function () {
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				//
				scope.$watch('ViewStateService.curViewPort', function (newValue, oldValue) {
					if (!$.isEmptyObject(SoundHandlerService)) {
						if (!$.isEmptyObject(SoundHandlerService.audioBuffer)) {
							// check for changed zoom
							if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS) {
								DrawHelperService.freshRedrawDrawOsciOnCanvas(canvas, ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS, false);
							}
							scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
						}
					}
				}, true);

				//
				scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
					if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
						DrawHelperService.freshRedrawDrawOsciOnCanvas(canvas, ViewStateService.curViewPort.sS, ViewStateService.curViewPort.eS, true);
					}
				}, true);

				//
				/////////////////////////

				scope.redraw = function () {
					scope.drawVpOsciMarkup(scope, ConfigProviderService, true);
				};

				/**
				 *
				 */
				scope.drawPlayHead = function (scope, config) {
					var ctx = markupCanvas.getContext('2d');
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					var posS = ViewStateService.getPos(markupCanvas.width, ViewStateService.playHeadAnimationInfos.sS);
					var posCur = ViewStateService.getPos(markupCanvas.width, ViewStateService.playHeadAnimationInfos.curS);
					ctx.fillStyle = ConfigProviderService.design.color.transparent.lightGrey;
					ctx.fillRect(posS, 0, posCur - posS, canvas.height);
					scope.drawVpOsciMarkup(scope, config, false);
				};

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */
				scope.drawVpOsciMarkup = function (scope, config, reset) {
					var ctx = markupCanvas.getContext('2d');
					if (reset) {
						ctx.clearRect(0, 0, markupCanvas.width, markupCanvas.height);
					}
					// draw moving boundary line if moving
					DrawHelperService.drawMovingBoundaryLine(ctx);
					DrawHelperService.drawViewPortTimes(ctx, true);
					// draw current viewport selected
					DrawHelperService.drawCurViewPortSelected(ctx, true);

                    DrawHelperService.drawCrossHairX(ctx, ViewStateService.curMouseX);
				};
			}
		};
	});
