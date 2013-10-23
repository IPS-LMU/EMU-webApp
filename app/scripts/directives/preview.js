'use strict';


angular.module('emulvcApp')
	.directive('preview', function() {
		return {
			templateUrl: 'views/preview.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas")[0];
				var myid = element[0].id;			
				
				scope.$watch('vs.curViewPort', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs.currentBuffer)) {
						// check for changed zoom
						if(oldValue.sS != newValue.sS || oldValue.sE != newValue.sE || newValue.selectS == -1){ // SIC -1 check not that clean...
							var allPeakVals = scope.dhs.calculatePeaks(scope.vs, canvas, scope.shs.currentBuffer.getChannelData(0));
							scope.dhs.osciPeaks = allPeakVals;
							
						}
						scope.dhs.freshRedrawDrawOsciOnCanvas(scope.vs, canvas, scope.dhs.osciPeaks, scope.shs.currentBuffer, scope.config);
						drawVpOsciMarkup(scope.vs, canvas, scope.config);						
					}
				}, true);			

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(viewState, canvas, config) {

					var ctx = canvas.getContext("2d");

					ctx.strokeStyle = config.vals.colors.labelColor;
					ctx.fillStyle = config.vals.colors.labelColor;
					ctx.font = (config.vals.colors.fontPxSize + "px" + " " + config.vals.colors.fontType);

					// lines to corners
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(5, 5);
					ctx.moveTo(canvas.width, 0);
					ctx.lineTo(canvas.width - 5, 5);
					ctx.closePath();
					ctx.stroke();

					var sTime;
					var eTime;
					if (viewState.curViewPort) {
						//draw time and sample nr
						sTime = viewState.round(viewState.curViewPort.sS / 44100, 6); //SIC hardcoded sample rate
						eTime = viewState.round(viewState.curViewPort.eS / 44100, 6); //SIC hardcoded sample rate
						ctx.fillText(viewState.curViewPort.sS, 5, config.vals.colors.fontPxSize);
						ctx.fillText(sTime, 5, config.vals.colors.fontPxSize * 2);
						var metrics = ctx.measureText(sTime);
						ctx.fillText(viewState.curViewPort.eS, canvas.width - ctx.measureText(viewState.curViewPort.eS).width - 5, config.vals.colors.fontPxSize);
						ctx.fillText(eTime, canvas.width - metrics.width - 5, config.vals.colors.fontPxSize * 2);
					}
				}
			}
		};
	});