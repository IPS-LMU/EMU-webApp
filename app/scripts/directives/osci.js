'use strict';


angular.module('emulvcApp')
	.directive('osci', function() {
		return {
			templateUrl: 'views/osci.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas")[0];

				var myid = element[0].id;

				scope.$watch('vs.curViewPort', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs.currentBuffer)) {
						drawVpOsciMarkup(scope.vs, canvas, scope.cps);						
					}
				}, true);			
				
				scope.$watch('vs', function(newValue, oldValue) {
					if (!$.isEmptyObject(scope.shs.currentBuffer)) {
						var allPeakVals = getPeaks(scope.vs, canvas, scope.shs.currentBuffer);
						freshRedrawDrawOsciOnCanvas(scope.vs, canvas, allPeakVals, scope.shs.currentBuffer, scope.cps);
						drawVpOsciMarkup(scope.vs, canvas, scope.cps);						
					}
				}, true);			
				


				/**
				 * get current peaks to be drawn
				 * if drawing over sample exact -> samples
				 * if multiple samples per pixel -> calculate envelope points
				 */

				function getPeaks(viewState, canvas, buffer) {
					var k = (viewState.curViewPort.eS - viewState.curViewPort.sS) / canvas.width; //this.osciCanvas.width; // PCM Samples per new pixel

					var peaks = [];
					var minPeak = Infinity;
					var maxPeak = -Infinity;

					var chan = buffer.getChannelData(0);
					var relData;

					if (k <= 1) {
						// check if view at start            
						if (viewState.curViewPort.sS === 0) {
							relData = chan.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + 2); // +2 to compensate for length
						} else {
							relData = chan.subarray(viewState.curViewPort.sS - 1, viewState.curViewPort.eS + 2); // +2 to compensate for length
						}
						minPeak = Math.min.apply(Math, relData);
						maxPeak = Math.max.apply(Math, relData);
						peaks = Array.prototype.slice.call(relData);

					} else {
						relData = chan.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS);

						for (var i = 0; i < canvas.width; i++) {
							var sum = 0;
							for (var c = 0; c < buffer.numberOfChannels; c++) {

								var vals = relData.subarray(i * k, (i + 1) * k);
								var peak = -Infinity;

								var av = 0;
								for (var p = 0, l = vals.length; p < l; p++) {
									if (vals[p] > peak) {
										peak = vals[p];
									}
									av += vals[p];
								}
								sum += av / vals.length;
							}

							peaks[i] = sum;
							if (sum > maxPeak) {
								maxPeak = sum;
							}
						}
					} //else
					return {
						"peaks": peaks,
						"minPeak": minPeak,
						"maxPeak": maxPeak,
						"samplePerPx": k
					};
				}


				/**
				 * @param cps color provider service
				 */

				function freshRedrawDrawOsciOnCanvas(viewState, canvas, allPeakVals, buffer, cps) {
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					//set font
					// ctx.font = (this.params.fontPxSize + "px" + " " + this.params.fontType);

					if (allPeakVals.peaks && allPeakVals.samplePerPx >= 1) {
						allPeakVals.peaks.forEach(function(peak, index) {
							if (index !== 0) {
								drawFrame(viewState, index, peak, allPeakVals.maxPeak, allPeakVals.peaks[index - 1], canvas, cps);
							}
						});

					} else if (allPeakVals.samplePerPx < 1) {
						// console.log("at 0 over sample exact")
						var hDbS = (1 / allPeakVals.samplePerPx) / 2; // half distance between samples
						var sNr = viewState.curViewPort.sS;
						// over sample exact
						ctx.strokeStyle = cps.vals.osciColor;
						ctx.fillStyle = cps.vals.osciColor;
						// ctx.beginPath();
						var i;
						if (viewState.curViewPort.sS === 0) {
							ctx.moveTo(hDbS, (allPeakVals.peaks[0] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height);
							for (i = 0; i < allPeakVals.peaks.length; i++) {
								ctx.lineTo(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height);
							}
							ctx.stroke();
							// draw sample dots
							for (i = 0; i < allPeakVals.peaks.length; i++) {
								ctx.beginPath();
								ctx.arc(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height - 3, 4, 0, 2 * Math.PI, false);
								ctx.stroke();
								ctx.fill();
								if (false) { // SIC !!!
									ctx.strokeText(sNr, i / allPeakVals.samplePerPx + hDbS, (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height - 10);
									sNr = sNr + 1;
								}
							}
						} else {
							//draw lines
							ctx.moveTo(-hDbS, canvas.height - ((allPeakVals.peaks[0] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height));
							for (i = 1; i < allPeakVals.peaks.length; i++) {
								ctx.lineTo(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height + 3));
							}
							ctx.stroke();
							// draw sample dots
							for (i = 1; i < allPeakVals.peaks.length; i++) {
								ctx.beginPath();
								ctx.arc(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height) - 3, 4, 0, 2 * Math.PI, false);
								ctx.stroke();
								ctx.fill();
								if (false) { // SIC !!! 
									ctx.fillText(sNr, i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height - 10);
									sNr = sNr + 1;
								}
							}

						}
					}
					if (true) { // SIC !!!
						// draw zero line
						ctx.strokeStyle = cps.vals.zeroLineColor;
						ctx.fillStyle = cps.vals.wwzeroLineColor;
						// see if Chrome ->dashed line
						if (navigator.vendor == "Google Inc.") {
							ctx.setLineDash([5]);
						}
						if (allPeakVals.samplePerPx >= 1) {
							ctx.strokeRect(0, canvas.height / 2, canvas.width, 2);
							ctx.fillText("0", 5, canvas.height / 2 - 5, canvas.width);
						} else {
							ctx.strokeRect(0, canvas.height - ((0 - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height), canvas.width, 1);
							ctx.fillText("0", 5, canvas.height - ((0 - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height) - 5, canvas.width);
						}
						// see if Chrome ->dashed line
						if (navigator.vendor == "Google Inc.") {
							ctx.setLineDash([0]);
						}
					}
				}

				/**
				 * drawing method to draw single line between two
				 * envelope points. Is used by drawOsciOnCanvas if
				 * envelope drawing is done
				 * @param index
				 * @param value
				 * @param max
				 * @param prevPeak
				 * @param canvas
				 */

				function drawFrame(viewState, index, value, max, prevPeak, canvas, cps) {

					var ctx = canvas.getContext("2d");

					//calculate sample of cur cursor position

					//calc cursor pos
					var all = viewState.curViewPort.eS - viewState.curViewPort.sS;
					var fracC = viewState.curCursorPosInPercent * viewState.bufferLength - viewState.curViewPort.sS;
					var procC = fracC / all;
					var posC = canvas.width * procC;

					//cur
					var w = 1;
					var h = Math.round(value * (canvas.height / max)); //rel to max
					var x = index * w;
					var y = Math.round((canvas.height - h) / 2);

					//prev
					var prevW = 1;
					var prevH = Math.round(prevPeak * (canvas.height / max));
					var prevX = (index - 1) * w;
					var prevY = Math.round((canvas.height - prevH) / 2);


					if (posC >= x) {
						ctx.fillStyle = cps.vals.playProgressColor;
						ctx.strokeStyle = cps.vals.playProgressColor;
					} else {
						ctx.fillStyle = cps.vals.osciColor;
						ctx.strokeStyle = cps.vals.osciColor;
					}

					ctx.beginPath();
					ctx.moveTo(prevX, prevY);
					ctx.lineTo(x, y);
					ctx.stroke();

				}

				/**
				 * draws markup of osci according to
				 * the information that is specified in
				 * the viewport
				 */

				function drawVpOsciMarkup(viewState, canvas, cps) {

					var ctx = canvas.getContext("2d");

					ctx.strokeStyle = cps.vals.labelColor;
					ctx.fillStyle = cps.vals.labelColor;
					ctx.font = (cps.vals.fontPxSize + "px" + " " + cps.vals.fontType);

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
						ctx.fillText(viewState.curViewPort.sS, 5, cps.vals.fontPxSize);
						ctx.fillText(sTime, 5, cps.vals.fontPxSize * 2);
						var metrics = ctx.measureText(sTime);
						ctx.fillText(viewState.curViewPort.eS, canvas.width - ctx.measureText(viewState.curViewPort.eS).width - 5, cps.vals.fontPxSize);
						ctx.fillText(eTime, canvas.width - metrics.width - 5, cps.vals.fontPxSize * 2);
					}
					//draw emulabeller.viewPortselected
					if (viewState.curViewPort.selectS !== -1 && viewState.curViewPort.selectE !== -1) {
						var posS = viewState.getPos(canvas.width, viewState.curViewPort.selectS);
						var posE = viewState.getPos(canvas.width, viewState.curViewPort.selectE);
						var sDist = viewState.getSampleDist(canvas.width);
						var xOffset;
						if (viewState.curViewPort.selectS == viewState.curViewPort.selectE) {
							// calc. offset dependant on type of tier of mousemove  -> default is sample exact
							if (viewState.curMouseMoveTierType == "seg") {
								xOffset = 0;
							} else {
								xOffset = (sDist / 2);
							}
							ctx.fillStyle = cps.vals.selectedBorderColor;
							ctx.fillRect(posS + xOffset, 0, 1, canvas.height);
							ctx.fillStyle = cps.vals.labelColor;
							ctx.fillText(viewState.round(viewState.curViewPort.selectS / 44100 + (1 / 44100) / 2, 6), posS + xOffset + 5, cps.vals.fontPxSize);
							ctx.fillText(viewState.curViewPort.selectS, posS + xOffset + 5, cps.vals.fontPxSize * 2);
						} else {
							ctx.fillStyle = cps.vals.selectedAreaColor;
							ctx.fillRect(posS, 0, posE - posS, canvas.height);
							ctx.strokeStyle = cps.vals.selectedBoundaryColor;
							ctx.beginPath();
							ctx.moveTo(posS, 0);
							ctx.lineTo(posS, canvas.height);
							ctx.moveTo(posE, 0);
							ctx.lineTo(posE, canvas.height);
							ctx.closePath();
							ctx.stroke();
							ctx.fillStyle = canvas.labelColor;
							// start values
							var tW = ctx.measureText(viewState.curViewPort.selectS).width;
							ctx.fillText(viewState.curViewPort.selectS, posS - tW - 4, cps.vals.fontPxSize);
							tW = ctx.measureText(viewState.round(viewState.curViewPort.selectS / 44100, 6)).width;
							ctx.fillText(viewState.round(viewState.curViewPort.selectS / 44100, 6), posS - tW - 4, cps.vals.fontPxSize * 2);
							// end values
							ctx.fillText(viewState.curViewPort.selectE, posE + 5, cps.vals.fontPxSize);
							ctx.fillText(viewState.round(viewState.curViewPort.selectE / 44100, 6), posE + 5, cps.vals.fontPxSize * 2);
							// dur values
							// check if space
							if (posE - posS > ctx.measureText(viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / 44100, 6)).width) {
								tW = ctx.measureText(viewState.curViewPort.selectE - viewState.curViewPort.selectS).width;
								ctx.fillText(viewState.curViewPort.selectE - viewState.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, cps.vals.fontPxSize);
								tW = ctx.measureText(viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / 44100, 6)).width;
								ctx.fillText(viewState.round(((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / 44100), 6), posS + (posE - posS) / 2 - tW / 2, cps.vals.fontPxSize * 2);
							}
						}
					}
				}
			}
		};
	});