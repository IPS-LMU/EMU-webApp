'use strict';

angular.module('emuwebApp')
	.directive('ssffTrack', function ($timeout, viewState, ConfigProviderService, loadedMetaDataService) {
		return {
			templateUrl: 'views/ssffTrack.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvasLength = element.find('canvas').length;
				var ssffCanvas = element.find('canvas')[1];
				var markupCanvas = element.find('canvas')[canvasLength - 1];
				// var context = canvas0.getContext('2d');
				var markupCtx = markupCanvas.getContext('2d');
				var trackName;
				scope.lmds = loadedMetaDataService;

				attrs.$observe('trackName', function (val) {
					if (val) {
						trackName = val;
					}
				});
				scope.order = attrs.order;


				/////////////////////
				// watches

				//
				//
				scope.$watch('vs.lastUpdate', function (newValue, oldValue) {
					if (newValue != oldValue) {
						scope.drawSsffTrackMarkup();
					}
				});

				//
				scope.$watch('vs.timelineSize', function () {
					$timeout(scope.drawSsffTrackMarkup, ConfigProviderService.design.animation.duration);
				});

				scope.$watch('vs.curViewPort', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							scope.drawSsffTrackMarkup();
						}
					}
				}, true);

				scope.$watch('ssffds.data.length', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							scope.drawSsffTrackMarkup();
						}
					}
				}, true);

				scope.$watch('vs.movingBoundary', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							scope.drawSsffTrackMarkup();
						}
					}
				}, true);


				scope.$watch('vs.movingBoundarySample', function () {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							scope.drawSsffTrackMarkup();
						}
					}
				}, true);

				//
				scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs)) {
						if (!$.isEmptyObject(scope.shs.wavJSO)) {
							if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
								scope.drawSsffTrackMarkup();
							}
						}
					}
				}, true);

				//
				/////////////////////

				/**
				 *
				 */
				scope.drawSsffTrackMarkup = function () {
					if (!$.isEmptyObject(scope.ssffds.data)) {
						if (scope.ssffds.data.length !== 0) {

							markupCtx.clearRect(0, 0, markupCtx.canvas.width, markupCtx.canvas.height);

							// draw moving boundary line if moving
							scope.dhs.drawMovingBoundaryLine(markupCtx);

							// draw current viewport selected
							scope.dhs.drawCurViewPortSelected(markupCtx, false);

							// draw min max an name of track
							var tr = scope.cps.getSsffTrackConfig(trackName);
							var col = scope.ssffds.getColumnOfTrack(tr.name, tr.columnName);
                            var minMaxValLims = scope.cps.getValueLimsOfTrack(tr.name);

                            var minVal, maxVal;
                            if(!angular.equals(minMaxValLims, {})){
                                minVal = minMaxValLims.minVal;
                                maxVal = minMaxValLims.maxVal;
                            }else{
                            	minVal = col._minVal;
                                maxVal = col._maxVal;
							}

							scope.dhs.drawMinMaxAndName(markupCtx, trackName, minVal, maxVal, 2);
						}
					}
				}
			}
		};
	});
