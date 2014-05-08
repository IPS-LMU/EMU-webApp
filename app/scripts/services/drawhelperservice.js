'use strict';

angular.module('emuwebApp')
	.service('Drawhelperservice', function Drawhelperservice(viewState, ConfigProviderService, Soundhandlerservice, fontScaleService, Levelservice) {

		//shared service object to be returned
		var sServObj = {};

		function getScale(ctx, str, scale) {
			return ctx.measureText(str).width * scale;
		}

		function getScaleWidth(ctx, str1, str2, scaleX) {
			if (str1.toString().length > str2.toString().length) {
				return getScale(ctx, str1, scaleX);
			} else {
				return getScale(ctx, str2, scaleX);
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

		function drawFrame(viewState, index, value, max, prevPeak, canvas, config) {

			var ctx = canvas.getContext('2d');

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
			// var prevW = 1;
			var prevH = Math.round(prevPeak * (canvas.height / max));
			var prevX = (index - 1) * w;
			var prevY = Math.round((canvas.height - prevH) / 2);


			if (posC >= x) {
				ctx.fillStyle = config.vals.colors.playProgressColor;
				ctx.strokeStyle = config.vals.colors.playProgressColor;
			} else {
				ctx.fillStyle = config.vals.colors.osciColor;
				ctx.strokeStyle = config.vals.colors.osciColor;
			}

			ctx.beginPath();
			ctx.moveTo(prevX, prevY);
			ctx.lineTo(x, y);
			ctx.stroke();

		}


		sServObj.osciPeaks = [];

		/**
		 *
		 */

		sServObj.getX = function (e) {
			return e.offsetX * (e.originalEvent.srcElement.width / e.originalEvent.srcElement.clientWidth);
		};

		/**
		 *
		 */

		sServObj.getY = function (e) {
			return e.offsetY * (e.originalEvent.srcElement.height / e.originalEvent.srcElement.clientHeight);
		};


		/**
		 * get current peaks to be drawn
		 * if drawing over sample exact -> samples
		 * if multiple samples per pixel -> calculate envelope points
		 */

		sServObj.calculatePeaks = function (viewState, canvas, data) {
			var k = (viewState.curViewPort.eS + 1 - viewState.curViewPort.sS) / canvas.width; // PCM Samples per new pixel + one for boundaries

			var numberOfChannels = 1; // hardcode for now...

			var peaks = [];
			var minPeak = Infinity;
			var maxPeak = -Infinity;

			var relData;

			if (k <= 1) {
				// check if view at start            
				if (viewState.curViewPort.sS === 0) {
					relData = data.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + 2); // +2 to compensate for length
				} else {
					relData = data.subarray(viewState.curViewPort.sS - 1, viewState.curViewPort.eS + 2); // +2 to compensate for length
				}
				minPeak = Math.min.apply(Math, relData);
				maxPeak = Math.max.apply(Math, relData);
				peaks = Array.prototype.slice.call(relData);

			} else {
				relData = data.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS);

				for (var i = 0; i < canvas.width; i++) {
					var sum = 0;
					for (var c = 0; c < numberOfChannels; c++) {

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
				'peaks': peaks,
				'minPeak': minPeak,
				'maxPeak': maxPeak,
				'samplePerPx': k
			};
		};



		/**
		 * @param cps color provider service
		 */

		sServObj.freshRedrawDrawOsciOnCanvas = function (viewState, canvas, allPeakVals, buffer, config) {
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			//set font
			// ctx.font = (this.params.fontPxSize + "px" + " " + this.params.fontType);

			if (allPeakVals.peaks && allPeakVals.samplePerPx >= 1) {
				allPeakVals.peaks.forEach(function (peak, index) {
					if (index !== 0) {
						drawFrame(viewState, index, peak, allPeakVals.maxPeak, allPeakVals.peaks[index - 1], canvas, config);
					}
				});

			} else if (allPeakVals.samplePerPx < 1) {
				// console.log("at 0 over sample exact")
				var hDbS = (1 / allPeakVals.samplePerPx) / 2; // half distance between samples
				var sNr = viewState.curViewPort.sS;
				// over sample exact
				ctx.strokeStyle = config.vals.colors.osciColor;
				ctx.fillStyle = config.vals.colors.osciColor;
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
						if (config.vals.restrictions.drawSampleNrs) {
							ctx.strokeText(sNr, i / allPeakVals.samplePerPx + hDbS, (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height - 10);
							sNr = sNr + 1;
						}
					}
				} else {
					//draw lines
					ctx.beginPath();
					ctx.moveTo(-hDbS, canvas.height - ((allPeakVals.peaks[0] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height));
					for (i = 1; i <= allPeakVals.peaks.length; i++) {
						ctx.lineTo(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height + 3));
					}
					ctx.stroke();
					// draw sample dots
					for (i = 1; i <= allPeakVals.peaks.length; i++) {
						ctx.beginPath();
						ctx.arc(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height) - 3, 4, 0, 2 * Math.PI, false);
						ctx.stroke();
						ctx.fill();
						if (config.vals.restrictions.drawSampleNrs) {
							ctx.fillText(sNr, i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.peaks[i] - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height - 10);
							sNr = sNr + 1;
						}
					}

				}
			}
			if (config.vals.restrictions.drawZeroLine) {
				// draw zero line
				ctx.strokeStyle = config.vals.colors.zeroLineColor;
				ctx.fillStyle = config.vals.colors.zeroLineColor;
				// see if Chrome ->dashed line
				if (navigator.vendor === 'Google Inc.') {
					ctx.setLineDash([2]);
				}
				if (allPeakVals.samplePerPx >= 1) {
					ctx.beginPath();
					ctx.moveTo(0, canvas.height / 2);
					ctx.lineTo(canvas.width, canvas.height / 2);
					ctx.stroke();
					ctx.fillText('0', 5, canvas.height / 2 - 5, canvas.width);
				} else {
					var zeroLineY = canvas.height - ((0 - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height);
					ctx.beginPath();
					ctx.moveTo(0, zeroLineY);
					ctx.lineTo(canvas.width, zeroLineY);
					ctx.stroke();
					ctx.fill();
					ctx.fillText('0', 5, canvas.height - ((0 - allPeakVals.minPeak) / (allPeakVals.maxPeak - allPeakVals.minPeak) * canvas.height) - 5, canvas.width);
				}
				// see if Chrome ->dashed line
				if (navigator.vendor === 'Google Inc.') {
					ctx.setLineDash([0]);
				}
			}
		};



		/**
		 * drawing method to drawMovingBoundaryLine
		 */

		sServObj.drawMovingBoundaryLine = function (ctx) {

			var xOffset, sDist;
			sDist = viewState.getSampleDist(ctx.canvas.width);

			// calc. offset dependant on type of level of mousemove  -> default is sample exact
			if (viewState.getcurMouseLevelType() === 'SEGMENT') {
				xOffset = 0;
			} else {
				xOffset = (sDist / 2);
			}

			if (viewState.movingBoundary) {
				ctx.fillStyle = ConfigProviderService.vals.colors.selectedBoundaryColor;
				// var tD = Levelservice.getLevelDetails(viewState.getcurMouseLevelName()).level;
				// var curM = viewState.getcurMouseSegment();
				// var item = Levelservice.getElementDetailsById(viewState.getcurMouseLevelName(), curM.id);
				// if (curM !== false && curM !== true) {
				// if (tD.type == "SEGMENT") {
				var p = Math.round(viewState.getPos(ctx.canvas.width, viewState.movingBoundarySample));
				// } else {
				// var p = Math.round(viewState.getPos(ctx.canvas.width, viewState.movingBoundarySample));
				// }
				ctx.fillRect(p + xOffset, 0, 1, ctx.canvas.height);
				// }
				// console.log('############')
				// console.log(viewState.movingBoundarySample)
				// console.log(p + xOffset)
			}

		};


		/**
		 * drawing method to drawCurViewPortSelected
		 */

		sServObj.drawCurViewPortSelected = function (ctx, drawTimeAndSamples) {

			var xOffset, sDist, space, horizontalText, scaleX;
			sDist = viewState.getSampleDist(ctx.canvas.width);

			// calc. offset dependant on type of level of mousemove  -> default is sample exact
			if (viewState.getcurMouseLevelType() === 'seg') {
				xOffset = 0;
			} else {
				xOffset = (sDist / 2);
			}

			var posS = viewState.getPos(ctx.canvas.width, viewState.curViewPort.selectS);
			var posE = viewState.getPos(ctx.canvas.width, viewState.curViewPort.selectE);

			if (posS === posE) {

				ctx.fillStyle = ConfigProviderService.vals.colors.selectedBorderColor;
				ctx.fillRect(posS + xOffset, 0, 2, ctx.canvas.height);

				if (drawTimeAndSamples) {
					if (viewState.curViewPort.sS !== viewState.curViewPort.selectS && viewState.curViewPort.selectS !== -1) {
						scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
						space = getScaleWidth(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / Soundhandlerservice.wavJSO.SampleRate, 6), scaleX);
						horizontalText = fontScaleService.getTextImageTwoLines(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / Soundhandlerservice.wavJSO.SampleRate, 6), ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, true);

						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posE + 5, 0, horizontalText.width, horizontalText.height);
					}
				}
			} else {
				ctx.fillStyle = ConfigProviderService.vals.colors.selectedAreaColor;
				ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
				ctx.strokeStyle = ConfigProviderService.vals.colors.selectedBorderColor;
				ctx.beginPath();
				ctx.moveTo(posS, 0);
				ctx.lineTo(posS, ctx.canvas.height);
				ctx.moveTo(posE, 0);
				ctx.lineTo(posE, ctx.canvas.height);
				ctx.closePath();
				ctx.stroke();

				if (drawTimeAndSamples) {
					// start values
					scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
					space = getScaleWidth(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / Soundhandlerservice.wavJSO.SampleRate, 6), scaleX);
					horizontalText = fontScaleService.getTextImageTwoLines(ctx, viewState.curViewPort.selectS, viewState.round(viewState.curViewPort.selectS / Soundhandlerservice.wavJSO.SampleRate, 6), ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, false);
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posS - space - 5, 0, horizontalText.width, horizontalText.height);

					// end values
					horizontalText = fontScaleService.getTextImageTwoLines(ctx, viewState.curViewPort.selectE, viewState.round(viewState.curViewPort.selectE / Soundhandlerservice.wavJSO.SampleRate, 6), ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, true);
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posE + 5, 0, horizontalText.width, horizontalText.height);
					// dur values
					// check if space
					space = getScale(ctx, viewState.round((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / Soundhandlerservice.wavJSO.SampleRate, 6), scaleX);

					if (posE - posS > space) {
						var str1 = viewState.curViewPort.selectE - viewState.curViewPort.selectS;
						var str2 = viewState.round(((viewState.curViewPort.selectE - viewState.curViewPort.selectS) / Soundhandlerservice.wavJSO.SampleRate), 6);

						space = getScaleWidth(ctx, str1, str2, scaleX);
						horizontalText = fontScaleService.getTextImageTwoLines(ctx, str1, str2, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, false);
						ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, posS + (posE - posS) / 2 - space / 2, 0, horizontalText.width, horizontalText.height);


					}
				}

			}

		};

		/**
		 * drawing method to drawCrossHairs
		 */

		sServObj.drawCrossHairs = function (ctx, mouseEvt, min, max, unit) {
			if (ConfigProviderService.vals.restrictions.drawCrossHairs) {

				// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.strokeStyle = ConfigProviderService.vals.colors.crossHairsColor;
				ctx.fillStyle = ConfigProviderService.vals.colors.crossHairsColor;

				// see if Chrome -> dashed line
				if (navigator.vendor === 'Google Inc.') {
					ctx.setLineDash([2]);
				}

				// draw lines
				var mouseX = sServObj.getX(mouseEvt);
				var mouseY = sServObj.getY(mouseEvt);

				ctx.beginPath();
				ctx.moveTo(0, mouseY);
				ctx.lineTo(5, mouseY + 5);
				ctx.moveTo(0, mouseY);
				ctx.lineTo(ctx.canvas.width, mouseY);
				ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
				ctx.moveTo(mouseX, 0);
				ctx.lineTo(mouseX, ctx.canvas.height);
				ctx.stroke();



				if (navigator.vendor === 'Google Inc.') {
					ctx.setLineDash([0]);
				}

				// draw frequency / sample / time
				ctx.font = (ConfigProviderService.vals.font.fontPxSize + 'px' + ' ' + ConfigProviderService.vals.font.fontType);

				var mouseFreq = viewState.round(max - mouseY / ctx.canvas.height * max, 2); // SIC only uses max

				var tW = ctx.measureText(mouseFreq + unit).width;
				var s1 = Math.round(viewState.curViewPort.sS + mouseX / ctx.canvas.width * (viewState.curViewPort.eS - viewState.curViewPort.sS));
				var s2 = viewState.round(viewState.getViewPortStartTime() + mouseX / ctx.canvas.width * (viewState.getViewPortEndTime() - viewState.getViewPortStartTime()), 6);
				var horizontalText = fontScaleService.getTextImage(ctx, mouseFreq + unit, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.crossHairsColor, true);
				var verticalText = fontScaleService.getTextImageTwoLines(ctx, s1, s2, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.crossHairsColor, true);

				if (max !== undefined || min !== undefined) {
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 5, mouseY, horizontalText.width, horizontalText.height);
					ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, ctx.canvas.width - 5 - tW * (ctx.canvas.width / ctx.canvas.offsetWidth), mouseY, horizontalText.width, horizontalText.height);
				}
				ctx.drawImage(verticalText, 0, 0, verticalText.width, verticalText.height, mouseX + 5, 0, verticalText.width, verticalText.height);

			}
		};

		/**
		 * drawing method to drawMinMaxAndName
		 * @param ctx is context to be drawn on
		 * @param trackName name of track to be drawn in the center of the canvas (left aligned)
		 * @param min value to be drawn at the bottom of the canvas (left aligned)
		 * @param max value to be drawn at the top of the canvas (left aligned)
		 * @param round value to round to for min/max values (== digits after comma)
		 */

		sServObj.drawMinMaxAndName = function (ctx, trackName, min, max, round) {

			// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.strokeStyle = ConfigProviderService.vals.colors.labelColor;
			ctx.fillStyle = ConfigProviderService.vals.colors.labelColor;

			// var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
			var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

			var smallFontSize = ConfigProviderService.vals.font.fontPxSize * 3 / 4;
			var th = smallFontSize * scaleY;

			// draw corner pointers
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(5, 5);
			ctx.moveTo(0, ctx.canvas.height);
			ctx.lineTo(5, ctx.canvas.height - 5);
			ctx.stroke();
			ctx.closePath();


			// draw ssffTrackName
			if (trackName !== '') {
				ctx.font = (ConfigProviderService.vals.font.fontPxSize + 'px' + ' ' + ConfigProviderService.vals.font.fontType);
				var trackNameImg = fontScaleService.getTextImage(ctx, trackName, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, true);
				ctx.drawImage(trackNameImg, 0, ctx.canvas.height / 2 - ConfigProviderService.vals.font.fontPxSize * scaleY / 2);
			}


			// draw min/max vals
			if (max !== undefined) {
				var labelTxtImg = fontScaleService.getTextImage(ctx, 'max: ' + viewState.round(max, round), smallFontSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.endBoundaryColor);
				ctx.drawImage(labelTxtImg, 5, 5, labelTxtImg.width, labelTxtImg.height);
			}
			// draw min/max vals
			if (min !== undefined) {
				labelTxtImg = fontScaleService.getTextImage(ctx, 'min: ' + viewState.round(min, round), smallFontSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.endBoundaryColor);
				ctx.drawImage(labelTxtImg, 5, ctx.canvas.height - th - 5, labelTxtImg.width, labelTxtImg.height);
			}
		};

		/**
		 *
		 */
		sServObj.drawViewPortTimes = function (ctx) {
			ctx.strokeStyle = ConfigProviderService.vals.colors.labelColor;
			ctx.fillStyle = ConfigProviderService.vals.colors.labelColor;
			ctx.font = (ConfigProviderService.vals.font.fontPxSize + 'px' + ' ' + ConfigProviderService.vals.font.fontType);

			// lines to corners
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(5, 5);
			ctx.moveTo(ctx.canvas.width, 0);
			ctx.lineTo(ctx.canvas.width - 5, 5);
			ctx.closePath();
			ctx.stroke();

			var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
			var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

			var sTime;
			var eTime;
			var horizontalText;
			var space;

			if (viewState.curViewPort) {
				//draw time and sample nr

				sTime = viewState.round(viewState.curViewPort.sS / Soundhandlerservice.wavJSO.SampleRate, 6);
				eTime = viewState.round(viewState.curViewPort.eS / Soundhandlerservice.wavJSO.SampleRate, 6);

				horizontalText = fontScaleService.getTextImageTwoLines(ctx, viewState.curViewPort.sS, sTime, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, true);
				// ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, 0, 0, horizontalText.width, horizontalText.height);
				ctx.drawImage(horizontalText, 5, 5);

				space = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
				horizontalText = fontScaleService.getTextImageTwoLines(ctx, viewState.curViewPort.eS, eTime, ConfigProviderService.vals.font.fontPxSize, ConfigProviderService.vals.font.fontType, ConfigProviderService.vals.colors.labelColor, false);
				ctx.drawImage(horizontalText, 0, 0, horizontalText.width, horizontalText.height, ctx.canvas.width - space - 5, 0, horizontalText.width, horizontalText.height);


				//draw dot at edge of image
				// var spaceW = getScaleWidth(ctx, viewState.curViewPort.eS, eTime, scaleX);
				// var startPoint = (Math.PI / 180) * 0;
				// var endPoint = (Math.PI / 180) * 360;
				// ctx.beginPath();
				// ctx.arc(spaceW, config.vals.font.fontPxSize * 2 * scaleY, 10, startPoint, endPoint, true);
				// ctx.fill();
				// ctx.closePath();


			}

		};


		return sServObj;
	});