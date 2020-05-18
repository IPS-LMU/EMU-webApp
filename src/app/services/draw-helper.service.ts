import * as angular from 'angular';

class DrawHelperService{

	private ViewStateService;
	private ConfigProviderService;
	private SoundHandlerService;
	private FontScaleService;
	private SsffDataService;
	private MathHelperService;

	private osciPeaks;

	constructor(ViewStateService, ConfigProviderService, SoundHandlerService, FontScaleService, SsffDataService, MathHelperService){
		this.ViewStateService = ViewStateService;
		this.ConfigProviderService = ConfigProviderService;
		this.SoundHandlerService = SoundHandlerService;
		this.FontScaleService = FontScaleService;
		this.SsffDataService = SsffDataService;
		this.MathHelperService = MathHelperService;

		this.osciPeaks = {};

	}

	private getScale(ctx, str, scale) {
		return ctx.measureText(str).width * scale;
	}

	private getScaleWidth(ctx, str1, str2, scaleX) {
		if (str1 !== undefined && str1.toString().length > str2.toString().length) {
			return this.getScale(ctx, str1, scaleX);
		} else {
			return this.getScale(ctx, str2, scaleX);
		}
	}

	/**
	 * 
	 */
	public calculateOsciPeaks () {
		var sampleRate = this.SoundHandlerService.audioBuffer.sampleRate;
		var numberOfChannels = this.SoundHandlerService.audioBuffer.numberOfChannels;

		// TODO mix all channels

		// calculate 3 peak levels (inspired by http://www.reaper.fm/sdk/reapeaks.txt files)
		//   1. At approximately 400 peaks/sec (divfactor 110 at 44khz)
		var winSize0 = Math.round(sampleRate / 400);
		//   2. At approximately 10 peaks/sec (divfactor 4410 at 44khz)
		var winSize1 = Math.round(sampleRate / 10);
		//   3. At approximately 1 peaks/sec (divfactor 44100 at 44khz)
		var winSize2 = Math.round(sampleRate / 1);

		// set initial result values
		this.osciPeaks = {
			'numberOfChannels': numberOfChannels,
			'sampleRate': sampleRate,
			'winSizes': [winSize0, winSize1, winSize2],
			'channelOsciPeaks': []
		};


		//////////////////////////
		// go through channels

		for(var channelIdx = 0; channelIdx < numberOfChannels; channelIdx++){

			var curChannelSamples = this.SoundHandlerService.audioBuffer.getChannelData(channelIdx);
		
			// preallocate min max peaks arrays
			var curChannelMaxPeaksWinSize0 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize0));
			var curChannelMinPeaksWinSize0 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize0));

			var curChannelMaxPeaksWinSize1 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize1));
			var curChannelMinPeaksWinSize1 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize1));

			var curChannelMaxPeaksWinSize2 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize2));
			var curChannelMinPeaksWinSize2 = new Float32Array(Math.round(this.SoundHandlerService.audioBuffer.length / winSize2));
			
			var curWindowIdxCounterWinSize0 = 0;
			var curPeakIdxWinSize0 = 0;
			var winMinPeakWinSize0 = Infinity;
			var winMaxPeakWinSize0 = -Infinity;

			var curWindowIdxCounterWinSize1 = 0;
			var curPeakIdxWinSize1 = 0;
			var winMinPeakWinSize1 = Infinity;
			var winMaxPeakWinSize1 = -Infinity;

			var curWindowIdxCounterWinSize2 = 0;
			var curPeakIdxWinSize2 = 0;
			var winMinPeakWinSize2 = Infinity;
			var winMaxPeakWinSize2 = -Infinity;


			for(var sampleIdx = 0; sampleIdx <= curChannelSamples.length; sampleIdx++){

				///////////////////////////
				// check if largest/smallest in window

				// winSize0
				if(curChannelSamples[sampleIdx] > winMaxPeakWinSize0){
					winMaxPeakWinSize0 = curChannelSamples[sampleIdx];
				}

				if(curChannelSamples[sampleIdx] < winMinPeakWinSize0){
					winMinPeakWinSize0 = curChannelSamples[sampleIdx];
				}

				// winSize1
				if(curChannelSamples[sampleIdx] > winMaxPeakWinSize1){
					winMaxPeakWinSize1 = curChannelSamples[sampleIdx];
				}

				if(curChannelSamples[sampleIdx] < winMinPeakWinSize1){
					winMinPeakWinSize1 = curChannelSamples[sampleIdx];
				}

				// winSize2
				if(curChannelSamples[sampleIdx] > winMaxPeakWinSize2){
					winMaxPeakWinSize2 = curChannelSamples[sampleIdx];
				}

				if(curChannelSamples[sampleIdx] < winMinPeakWinSize2){
					winMinPeakWinSize2 = curChannelSamples[sampleIdx];
				}

				////////////////////////////
				// add to peaks array

				// winSize0
				if(curWindowIdxCounterWinSize0 === winSize0){
					curChannelMaxPeaksWinSize0[curPeakIdxWinSize0] = winMaxPeakWinSize0;
					curChannelMinPeaksWinSize0[curPeakIdxWinSize0] = winMinPeakWinSize0;
					curPeakIdxWinSize0 += 1;
					// reset win vars
					curWindowIdxCounterWinSize0 = 0;
					winMinPeakWinSize0 = Infinity;
					winMaxPeakWinSize0 = -Infinity;
				}

				// winSize1
				if(curWindowIdxCounterWinSize1 === winSize1){
					curChannelMaxPeaksWinSize1[curPeakIdxWinSize1] = winMaxPeakWinSize1;
					curChannelMinPeaksWinSize1[curPeakIdxWinSize1] = winMinPeakWinSize1;
					curPeakIdxWinSize1 += 1;
					// reset win vars
					curWindowIdxCounterWinSize1 = 0;
					winMinPeakWinSize1 = Infinity;
					winMaxPeakWinSize1 = -Infinity;
				}

				// winSize2
				if(curWindowIdxCounterWinSize2 === winSize2){
					curChannelMaxPeaksWinSize2[curPeakIdxWinSize2] = winMaxPeakWinSize2;
					curChannelMinPeaksWinSize2[curPeakIdxWinSize2] = winMinPeakWinSize2;
					curPeakIdxWinSize2 += 1;
					// reset win vars
					curWindowIdxCounterWinSize2 = 0;
					winMinPeakWinSize2 = Infinity;
					winMaxPeakWinSize2 = -Infinity;
				}

				curWindowIdxCounterWinSize0 += 1;
				curWindowIdxCounterWinSize1 += 1;
				curWindowIdxCounterWinSize2 += 1;
			}

			this.osciPeaks.channelOsciPeaks[channelIdx] = {
				'maxPeaks': [curChannelMaxPeaksWinSize0, curChannelMaxPeaksWinSize1, curChannelMaxPeaksWinSize2],
				'minPeaks': [curChannelMinPeaksWinSize0, curChannelMinPeaksWinSize1, curChannelMinPeaksWinSize2]
			};

		}
	};

	/**
	 * get current peaks to be drawn
	 * if drawing over sample exact -> samples
	 * if multiple samples per pixel -> calculate envelope points
	 * @param canvas canvas object used to get width
	 * @param data samples as arraybuffer
	 * @param sS start sample
	 * @param eS end sample
	 */

	public calculatePeaks(canvas, data, sS, eS) {
		
		var samplePerPx = (eS + 1 - sS) / canvas.width; // samples per pixel + one to correct for subtraction
		// var numberOfChannels = 1; // hardcode for now...
		// init result values for over sample exact
		var samples = [];
		var minSamples;
		var maxSamples;
		// init result values for envelope
		// var maxPeaks = [];
		// var minPeaks = [];
		var minMinPeak = Infinity;
		var maxMaxPeak = -Infinity;

		var winStartSample;
		var winEndSample;
		var winMinPeak = Infinity;
		var winMaxPeak = -Infinity;

		var relData;

		if (samplePerPx <= 1) {
			// check if view at start
			if (sS === 0) {
				relData = data.subarray(sS, eS + 2); // +2 to compensate for length
			} else {
				relData = data.subarray(sS - 1, eS + 2); // +2 to compensate for length
			}

			minSamples = Math.min.apply(Math, relData);
			maxSamples = Math.max.apply(Math, relData);
			samples = Array.prototype.slice.call(relData);

		} else {

			relData = data.subarray(sS, eS);
			// preallocate arraybuffer
			var maxPeaks = new Float32Array(canvas.width);
			var minPeaks = new Float32Array(canvas.width);

			for (var curPxIdx = 0; curPxIdx < canvas.width; curPxIdx++) {
				//for (var c = 0; c < numberOfChannels; c++) {
				// get window arround current pixel
				winStartSample = curPxIdx * samplePerPx - samplePerPx/2;
				winEndSample = curPxIdx * samplePerPx + samplePerPx/2;
				if(winStartSample < 0){ // at start of file the won't have the full length (other option would be left padding)
					winStartSample = 0;
				}
				var vals = relData.subarray(winStartSample, winEndSample);

				// var sum = 0;
				winMinPeak = Infinity;
				winMaxPeak = -Infinity;
				for (var p = 0; p < vals.length; p++) {
					if(vals[p] > winMaxPeak){
						winMaxPeak = vals[p];
					}

					if(vals[p] < winMinPeak){
						winMinPeak = vals[p];
					}

					// sum += vals[p];
				}
				// avrVal = sum / vals.length;
				//}

				maxPeaks[curPxIdx] = winMaxPeak;
				minPeaks[curPxIdx] = winMinPeak;
				if (winMaxPeak > maxMaxPeak) {
					maxMaxPeak = winMaxPeak;
				}
				if (winMinPeak < minMinPeak) {
					minMinPeak = winMinPeak;
				}
			}
		} //else
		
		return {
			'samples': samples,
			'minSample': minSamples,
			'maxSample': maxSamples,
			'minPeaks': minPeaks,
			'maxPeaks': maxPeaks,
			'minMinPeak': minMinPeak,
			'maxMaxPeak': maxMaxPeak,
			'samplePerPx': samplePerPx
		};
	};


	public findMinMaxPeaks(sS, eS, winIdx){

		var ssT = this.ViewStateService.calcSampleTime(sS);
		var esT = this.ViewStateService.calcSampleTime(eS);

		// calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
		var pps = this.osciPeaks.sampleRate / this.osciPeaks.winSizes[winIdx];

		var startPeakWinIdx = ssT * pps;
		var endPeakWinIdx = esT * pps;

		var minMinPeak = Infinity;
		var maxMaxPeak = -Infinity;

		for(var i = Math.round(startPeakWinIdx); i < Math.round(endPeakWinIdx); i++){
			if (this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i] > maxMaxPeak) {
				maxMaxPeak = this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][i];
			}
			if (this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i] < minMinPeak) {
				minMinPeak = this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][i];
			}
		}

		return {
			// 'minPeaks': this.osciPeaks.channelOsciPeaks[0].minPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
			// 'maxPeaks': this.osciPeaks.channelOsciPeaks[0].maxPeaks.subarray(startPeakWinIdx, endPeakWinIdx),
			'minMinPeak': minMinPeak,
			'maxMaxPeak': maxMaxPeak
		};

	};

	/**
	 *
	 */

	public freshRedrawDrawOsciOnCanvas(canvas, sS, eS, forceToCalcOsciPeaks) {

		// clear canvas
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if(forceToCalcOsciPeaks){
			this.osciPeaks = {};
		}

		// calc osciPeaks if these have not been calculated yet
		if(angular.equals({}, this.osciPeaks)){
			this.calculateOsciPeaks();
		}

		// samples per pixel + one to correct for subtraction
		var samplesPerPx = (eS + 1 - sS) / canvas.width; 

		var i;

		// find current peaks array window size by checking if 
		var winIdx = -1;
		for (i = 0; i < this.osciPeaks.winSizes.length; i++) {
			if(samplesPerPx > this.osciPeaks.winSizes[i]){
				winIdx = i;
			}
		}

		var allPeakVals;

		var yMax, yMin;
		var yMaxPrev, yMinPrev;

		if(winIdx !== -1){
			// use pre calcuated peaks
			allPeakVals = this.findMinMaxPeaks(sS, eS, winIdx);

			var ssT = this.ViewStateService.calcSampleTime(sS);

			// calc exact peaks per second value (should be very close to or exactly 400|10|1 depending on  winSize)
			var pps = this.osciPeaks.sampleRate / this.osciPeaks.winSizes[winIdx];

			var startPeakWinIdx = ssT * pps;

			ctx.strokeStyle = this.ConfigProviderService.design.color.white;
			
			var peakIdx = Math.round(startPeakWinIdx);
			ctx.beginPath();
			yMax = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
			yMin = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
			ctx.moveTo(0, yMax);
			// ctx.lineTo(0, yMin);
			yMaxPrev = yMax;
			yMinPrev = yMin;

			var sT, perc, curSample;
			for (var curPxIdx = 1; curPxIdx < canvas.width; curPxIdx++) {
				perc = curPxIdx / canvas.width;
				curSample = this.ViewStateService.getCurrentSample(perc);
				// calculate cur pixel sample time
				sT = this.ViewStateService.calcSampleTime(curSample);
				peakIdx = Math.round(sT * pps);
				yMax = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].maxPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
				yMin = ((allPeakVals.maxMaxPeak - this.osciPeaks.channelOsciPeaks[0].minPeaks[winIdx][peakIdx]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
				// draw connection to previous peaks (neccesary to avoid gaps in osci when maxMaxPeak === minMinPeak)
				ctx.moveTo(curPxIdx-1, yMaxPrev);
				ctx.lineTo(curPxIdx-1, yMax);
				ctx.moveTo(curPxIdx-1, yMinPrev);
				ctx.lineTo(curPxIdx-1, yMin);

				// connect current min and max peaks
				ctx.moveTo(curPxIdx, yMax);
				ctx.lineTo(curPxIdx, yMin);


				yMaxPrev = yMax;
				yMinPrev = yMin;

			}

			ctx.stroke();

		}else{
			// if winIdx is -1 then calculate the peaks from the channel data
			allPeakVals = this.calculatePeaks(canvas, this.SoundHandlerService.audioBuffer.getChannelData(this.ViewStateService.osciSettings.curChannel), sS, eS);
		
			// check if envelope is to be drawn
			if (allPeakVals.minPeaks && allPeakVals.maxPeaks && allPeakVals.samplePerPx >= 1) {
				// draw envelope
				ctx.strokeStyle = this.ConfigProviderService.design.color.white;
				
				ctx.beginPath();
				yMax = ((allPeakVals.maxMaxPeak - allPeakVals.maxPeaks[0]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
				yMin = ((allPeakVals.maxMaxPeak - allPeakVals.minPeaks[0]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
				ctx.moveTo(0, yMax);
				ctx.lineTo(0, yMin);

				yMaxPrev = yMax;
				yMinPrev = yMin;

				for(i = 1; i < canvas.width; i++){
					yMax = ((allPeakVals.maxMaxPeak - allPeakVals.maxPeaks[i]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
					yMin = ((allPeakVals.maxMaxPeak - allPeakVals.minPeaks[i]) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak)) * canvas.height;
					// draw connection to previous peaks (neccesary to avoid gaps in osci when maxMaxPeak === minMinPeak)
					ctx.moveTo(i-1, yMaxPrev);
					ctx.lineTo(i-1, yMax);
					ctx.moveTo(i-1, yMinPrev);
					ctx.lineTo(i-1, yMin);

					// connect current min and max peaks
					ctx.moveTo(i, yMax);
					ctx.lineTo(i, yMin);

					yMaxPrev = yMax;
					yMinPrev = yMin;

				}
				ctx.stroke();

			// otherwise draw samples
			} else if (allPeakVals.samplePerPx < 1) {
				// console.log("at 0 over sample exact")
				var hDbS = (1 / allPeakVals.samplePerPx) / 2; // half distance between samples
				var sNr = this.ViewStateService.curViewPort.sS;
				// over sample exact
				ctx.strokeStyle = this.ConfigProviderService.design.color.white;
				ctx.fillStyle = this.ConfigProviderService.design.color.white;
				// ctx.beginPath();
				if (this.ViewStateService.curViewPort.sS === 0) {
					ctx.moveTo(hDbS, (allPeakVals.samples[0] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
					for (i = 0; i < allPeakVals.samples.length; i++) {
						ctx.lineTo(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
					}
					ctx.stroke();
					// draw sample dots
					for (i = 0; i < allPeakVals.samples.length; i++) {
						ctx.beginPath();
						ctx.arc(i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 3, 4, 0, 2 * Math.PI, false);
						ctx.stroke();
						ctx.fill();
						if (this.ConfigProviderService.vals.restrictions.drawSampleNrs) {
							ctx.strokeText(sNr, i / allPeakVals.samplePerPx + hDbS, (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
							sNr = sNr + 1;
						}
					}
				} else {
					//draw lines
					ctx.beginPath();
					ctx.moveTo(-hDbS, canvas.height - ((allPeakVals.samples[0] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height));
					for (i = 1; i <= allPeakVals.samples.length; i++) {
						ctx.lineTo(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height + 3));
					}
					ctx.stroke();
					// draw sample dots
					for (i = 1; i <= allPeakVals.samples.length; i++) {
						ctx.beginPath();
						ctx.arc(i / allPeakVals.samplePerPx - hDbS, canvas.height - ((allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height) - 3, 4, 0, 2 * Math.PI, false);
						ctx.stroke();
						ctx.fill();
						if (this.ConfigProviderService.vals.restrictions.drawSampleNrs) {
							ctx.fillText(sNr, i / allPeakVals.samplePerPx - hDbS, canvas.height - (allPeakVals.samples[i] - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height - 10);
							sNr = sNr + 1;
						}
					}

				}
			}
		}

		if (this.ConfigProviderService.vals.restrictions.drawZeroLine) {
			// draw zero line
			ctx.strokeStyle = this.ConfigProviderService.design.color.blue;
			ctx.fillStyle = this.ConfigProviderService.design.color.blue;

			var zeroLineY;

			if (samplesPerPx >= 1) {
				zeroLineY = canvas.height - ((0 - allPeakVals.minMinPeak) / (allPeakVals.maxMaxPeak - allPeakVals.minMinPeak) * canvas.height);
				ctx.beginPath();
				ctx.moveTo(0, zeroLineY);
				ctx.lineTo(canvas.width, zeroLineY);
				ctx.stroke();
				ctx.fillText('0', 5, zeroLineY - 5, canvas.width);
			} else {
				zeroLineY = canvas.height - ((0 - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height);
				ctx.beginPath();
				ctx.moveTo(0, zeroLineY);
				ctx.lineTo(canvas.width, zeroLineY);
				ctx.stroke();
				ctx.fill();
				ctx.fillText('0', 5, canvas.height - ((0 - allPeakVals.minSample) / (allPeakVals.maxSample - allPeakVals.minSample) * canvas.height) - 5, canvas.width);
			}
		}
	};


	/**
	 * drawing method to drawMovingBoundaryLine
	 */

	public drawMovingBoundaryLine(ctx) {

		var xOffset, sDist;
		sDist = this.ViewStateService.getSampleDist(ctx.canvas.width);

		// calc. offset dependant on type of level of mousemove  -> default is sample exact
		if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
			xOffset = 0;
		} else {
			xOffset = (sDist / 2);
		}

		if (this.ViewStateService.movingBoundary) {
			ctx.fillStyle = this.ConfigProviderService.design.color.blue;
			var p = Math.round(this.ViewStateService.getPos(ctx.canvas.width, this.ViewStateService.movingBoundarySample));
			if (this.ViewStateService.getcurMouseisLast()) {
				ctx.fillRect(p + sDist, 0, 1, ctx.canvas.height);
			} else {
				ctx.fillRect(p + xOffset, 0, 1, ctx.canvas.height);
			}
		}

	};


	/**
	 * drawing method to drawCurViewPortSelected
	 */

	public drawCurViewPortSelected(ctx, drawTimeAndSamples) {

		var fontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
		var xOffset, sDist, space, scaleX;
		sDist = this.ViewStateService.getSampleDist(ctx.canvas.width);

		// calc. offset dependant on type of level of mousemove  -> default is sample exact
		if (this.ViewStateService.getcurMouseLevelType() === 'seg') {
			xOffset = 0;
		} else {
			xOffset = (sDist / 2);
		}

		var posS = this.ViewStateService.getPos(ctx.canvas.width, this.ViewStateService.curViewPort.selectS);
		var posE = this.ViewStateService.getPos(ctx.canvas.width, this.ViewStateService.curViewPort.selectE);

		if (posS === posE) {

			ctx.fillStyle = this.ConfigProviderService.design.color.white;
			ctx.fillRect(posS + xOffset, 0, 2, ctx.canvas.height);

			if (drawTimeAndSamples) {
				if (this.ViewStateService.curViewPort.sS !== this.ViewStateService.curViewPort.selectS && this.ViewStateService.curViewPort.selectS !== -1) {
					scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
					space = this.getScaleWidth(
						ctx, 
						this.ViewStateService.curViewPort.selectS, 
						this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.selectS / this.SoundHandlerService.audioBuffer.sampleRate, 6), 
						scaleX);
					this.FontScaleService.drawUndistortedTextTwoLines(
						ctx, 
						this.ViewStateService.curViewPort.selectS, 
						this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.selectS / this.SoundHandlerService.audioBuffer.sampleRate, 6), 
						fontSize, 
						this.ConfigProviderService.design.font.small.family, 
						posE + 5, 
						0, 
						this.ConfigProviderService.design.color.white, 
						true);
				}
			}
		} else {
			ctx.fillStyle = this.ConfigProviderService.design.color.transparent.lightGrey;
			ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
			ctx.strokeStyle = this.ConfigProviderService.design.color.white;
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
				space = this.getScaleWidth(
					ctx, 
					this.ViewStateService.curViewPort.selectS, 
					this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.selectS / this.SoundHandlerService.audioBuffer.sampleRate, 6), 
					scaleX);
				this.FontScaleService.drawUndistortedTextTwoLines(
					ctx, 
					this.ViewStateService.curViewPort.selectS, 
					this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.selectS / this.SoundHandlerService.audioBuffer.sampleRate, 6), 
					fontSize, 
					this.ConfigProviderService.design.font.small.family, 
					posS - space - 5, 
					0, 
					this.ConfigProviderService.design.color.white, 
					false);

				// end values
				this.FontScaleService.drawUndistortedTextTwoLines(ctx, this.ViewStateService.curViewPort.selectE, this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.selectE / this.SoundHandlerService.audioBuffer.sampleRate, 6), fontSize, this.ConfigProviderService.design.font.small.family, posE + 5, 0, this.ConfigProviderService.design.color.white, true);
				// dur values
				// check if space
				space = this.getScale(ctx, this.MathHelperService.roundToNdigitsAfterDecPoint((this.ViewStateService.curViewPort.selectE - this.ViewStateService.curViewPort.selectS) / this.SoundHandlerService.audioBuffer.sampleRate, 6), scaleX);

				if (posE - posS > space) {
					var str1 = this.ViewStateService.curViewPort.selectE - this.ViewStateService.curViewPort.selectS - 1;
					var str2 = this.MathHelperService.roundToNdigitsAfterDecPoint(((this.ViewStateService.curViewPort.selectE - this.ViewStateService.curViewPort.selectS) / this.SoundHandlerService.audioBuffer.sampleRate), 6);
					space = this.getScaleWidth(ctx, str1, str2, scaleX);
					this.FontScaleService.drawUndistortedTextTwoLines(ctx, str1, str2, fontSize, this.ConfigProviderService.design.font.small.family, posS + (posE - posS) / 2 - space / 2, 0, this.ConfigProviderService.design.color.white, false);
				}
			}

		}

	};


	/**
	 * only draw x (= vertical) line of crosshair
	 * this is used to draw a red line at the current mouse position
	 * on canvases where the mouse is currently not hovering over
	 */
	public drawCrossHairX(ctx, mouseX){
		ctx.strokeStyle = this.ConfigProviderService.design.color.red;
		ctx.fillStyle = this.ConfigProviderService.design.color.red;
		ctx.beginPath();
		ctx.moveTo(mouseX, 0);
		ctx.lineTo(mouseX, ctx.canvas.height);
		ctx.stroke();
	};

	/**
	 * drawing method to drawCrossHairs
	 */

	public drawCrossHairs(ctx, mouseEvt, min, max, unit, trackname) {
		// console.log(MathHelperService.roundToNdigitsAfterDecPoint(min, round))
		if (this.ConfigProviderService.vals.restrictions.drawCrossHairs) {

			var fontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
			// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.strokeStyle = this.ConfigProviderService.design.color.red;
			ctx.fillStyle = this.ConfigProviderService.design.color.red;

			// see if Chrome -> dashed line
			//if (navigator.vendor === 'Google Inc.') {
			//	ctx.setLineDash([2]);
			//}

			// draw lines
			var mouseX = this.ViewStateService.getX(mouseEvt);
			var mouseY = this.ViewStateService.getY(mouseEvt);

			//if (navigator.vendor === 'Google Inc.') {
			//	ctx.setLineDash([0]);
			//}

			// draw frequency / sample / time
			ctx.font = (this.ConfigProviderService.design.font.small.size + 'px ' + this.ConfigProviderService.design.font.small.family);
			var mouseFreq = this.MathHelperService.roundToNdigitsAfterDecPoint(max - mouseY / ctx.canvas.height * max, 2); // SIC only uses max
			var tW = ctx.measureText(mouseFreq + unit).width * this.FontScaleService.scaleX;
			var tH = fontSize * this.FontScaleService.scaleY;
			var s1 = Math.round(this.ViewStateService.curViewPort.sS + mouseX / ctx.canvas.width * (this.ViewStateService.curViewPort.eS - this.ViewStateService.curViewPort.sS));
			var s2 = this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.getViewPortStartTime() + mouseX / ctx.canvas.width * (this.ViewStateService.getViewPortEndTime() - this.ViewStateService.getViewPortStartTime()), 6);

			var y;
			if(mouseY + tH < ctx.canvas.height){
				y = mouseY + 5;
			}else{
				y = mouseY - tH - 5;
			}

			if (max !== undefined || min !== undefined) {
				if (trackname === 'OSCI') {
					// no horizontal values
					ctx.strokeStyle = this.ConfigProviderService.design.color.red;
					ctx.fillStyle = this.ConfigProviderService.design.color.red;
					ctx.beginPath();
					ctx.moveTo(mouseX, 0);
					ctx.lineTo(mouseX, ctx.canvas.height);
					ctx.stroke();
				} else if (trackname === 'SPEC') {
					this.FontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, this.ConfigProviderService.design.font.small.family, 5, y, this.ConfigProviderService.design.color.red, true);
					this.FontScaleService.drawUndistortedText(ctx, mouseFreq + unit, fontSize, this.ConfigProviderService.design.font.small.family, ctx.canvas.width - tW, y, this.ConfigProviderService.design.color.red, true);

					ctx.beginPath();
					ctx.moveTo(0, mouseY);
					ctx.lineTo(5, mouseY + 5);
					ctx.moveTo(0, mouseY);
					ctx.lineTo(ctx.canvas.width, mouseY);
					ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
					ctx.moveTo(mouseX, 0);
					ctx.lineTo(mouseX, ctx.canvas.height);
					ctx.stroke();
				} else {
					// draw min max an name of track
					var tr = this.ConfigProviderService.getSsffTrackConfig(trackname);
					var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
					mouseFreq = col._maxVal - (mouseY / ctx.canvas.height * (col._maxVal - col._minVal));
					mouseFreq = this.MathHelperService.roundToNdigitsAfterDecPoint(mouseFreq, 2); // crop
					this.FontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, this.ConfigProviderService.design.font.small.family, 5, y, this.ConfigProviderService.design.color.transparent.red, true);
					this.FontScaleService.drawUndistortedText(ctx, mouseFreq, fontSize, this.ConfigProviderService.design.font.small.family, ctx.canvas.width - 5 - tW, y, this.ConfigProviderService.design.color.transparent.red, true);
					ctx.beginPath();
					ctx.moveTo(0, mouseY);
					ctx.lineTo(5, mouseY + 5);
					ctx.moveTo(0, mouseY);
					ctx.lineTo(ctx.canvas.width, mouseY);
					ctx.lineTo(ctx.canvas.width - 5, mouseY + 5);
					ctx.moveTo(mouseX, 0);
					ctx.lineTo(mouseX, ctx.canvas.height);
					ctx.stroke();
				}
			}
			this.FontScaleService.drawUndistortedTextTwoLines(ctx, s1, s2, fontSize, this.ConfigProviderService.design.font.small.family, mouseX + 5, 0, this.ConfigProviderService.design.color.transparent.red, true);
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

	public drawMinMaxAndName(ctx, trackName, min, max, round) {
		// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeStyle = this.ConfigProviderService.design.color.black;
		ctx.fillStyle = this.ConfigProviderService.design.color.black;

		var fontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1;

		// var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
		var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

		var smallFontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 3 / 4;
		var th = smallFontSize * scaleY;

		// draw corner pointers
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(5, 5);
		ctx.moveTo(0, ctx.canvas.height);
		ctx.lineTo(5, ctx.canvas.height - 5);
		ctx.stroke();
		ctx.closePath();

		// draw trackName
		if (trackName !== '') {
			this.FontScaleService.drawUndistortedText(ctx, trackName, fontSize, this.ConfigProviderService.design.font.small.family, 0, ctx.canvas.height / 2 - fontSize * scaleY / 2, this.ConfigProviderService.design.color.black, true);
		}

		// draw min/max vals
		if (max !== undefined) {
			this.FontScaleService.drawUndistortedText(ctx, 'max: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(max, round), smallFontSize, this.ConfigProviderService.design.font.small.family, 5, 5, this.ConfigProviderService.design.color.grey, true);
		}
		// draw min/max vals
		if (min !== undefined) {
			this.FontScaleService.drawUndistortedText(ctx, 'min: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(min, round), smallFontSize, this.ConfigProviderService.design.font.small.family, 5, ctx.canvas.height - th - 5, this.ConfigProviderService.design.color.grey, true);
		}
	};

	/**
	 *
	 */
	public drawViewPortTimes(ctx) {
		ctx.strokeStyle = this.ConfigProviderService.design.color.white;
		ctx.fillStyle = this.ConfigProviderService.design.color.white;
		ctx.font = (this.ConfigProviderService.design.font.small.size + ' ' + this.ConfigProviderService.design.font.small.family);

		var fontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1;

		// lines to corners
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(5, 5);
		ctx.moveTo(ctx.canvas.width, 0);
		ctx.lineTo(ctx.canvas.width - 5, 5);
		ctx.closePath();
		ctx.stroke();
		var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
		var sTime;
		var eTime;
		var space;
		if (this.ViewStateService.curViewPort) {
			//draw time and sample nr
			sTime = this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.sS / this.SoundHandlerService.audioBuffer.sampleRate, 6);
			eTime = this.MathHelperService.roundToNdigitsAfterDecPoint(this.ViewStateService.curViewPort.eS / this.SoundHandlerService.audioBuffer.sampleRate, 6);
			this.FontScaleService.drawUndistortedTextTwoLines(ctx, this.ViewStateService.curViewPort.sS, sTime, fontSize, this.ConfigProviderService.design.font.small.family, 5, 0, this.ConfigProviderService.design.color.white, true);
			space = this.getScaleWidth(ctx, this.ViewStateService.curViewPort.eS, eTime, scaleX);
			this.FontScaleService.drawUndistortedTextTwoLines(ctx, this.ViewStateService.curViewPort.eS, eTime, fontSize, this.ConfigProviderService.design.font.small.family, ctx.canvas.width - space - 5, 0, this.ConfigProviderService.design.color.white, false);
		}
	};


}

angular.module('emuwebApp')
	.service('DrawHelperService', DrawHelperService);
