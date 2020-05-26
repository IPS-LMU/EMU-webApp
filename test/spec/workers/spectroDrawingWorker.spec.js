'use strict';

describe('Worker: spectroDrawingWorker', function () {

	var worker, mockGlobal;

	// var blob1, blob2, binary;

	var start = 2000;
	var end = 5000;
	// var windowLength = 256;
	// var window = 5;
	// var width = 2048;
	// var height = 150;
	// var step = (end - start) / width;
	// var pixelRatio = 1;
	// var sampleRate = 20000;
	// var upperFreq = 5000;
	// var lowerFreq = 0;
	// var samplesPerPxl = 1;
	// var mockData.audioBuffer = [];
	// var HzStep = (sampleRate / 2) / (windowLength / 2);
	// var pixelHeight = height / (Math.ceil(freq / HzStep) - Math.floor(freqLow / HzStep) - 2);

	var mockData = {
		'windowSizeInSecs': 0.001,
		'fftN': 512,
		'alpha': 0.16,
		'upperFreq': 5000,
		'lowerFreq': 0,
		'samplesPerPxl': 1,
		'window': 5,
		'imgWidth': 4096,
		'imgHeight': 150,
		'dynRangeInDB': 70,
		'pixelRatio': 1,
		'sampleRate': 20000,
		'transparency': 255,
		'audioBuffer': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
		'audioBufferChannels': 1,
		'drawHeatMapColors': false,
		'preEmphasisFilterFactor': 0.97,
		'heatMapColorAnchors': JSON.parse('[[255,0,0],[0,255,0],[0,0,0]]')
	}

	var windowData, samples;


	beforeEach(module('emuwebApp'));

	beforeEach(function () {
		var DummyWorker = function () {};
		worker = new SpectroDrawingWorker(DummyWorker);
		// mock the global scope for the worker thread.
		mockGlobal = {
			postMessage: jasmine.createSpy('postMessage'),
		};
		// call the initWorker method we use to build the worker script.
		worker.workerInit(mockGlobal);

		// set window function test data
		windowData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

		// set samples
		samples = [5, -2, 17, -5, -5, -2, -2, 9, 1, 6, 18, -1, 5, 0, 0, -3, -4, 5, 11, 6, -9, 5, 14, 5, 11, 10, 1, -12, -20, -17, -5, -1, -13, -11, -32, -39, -22, -32, -12, -21, -31, -31, -30, -28, -41, -46, -37, -24, -23, -30, -48, -45, -47, -47, -55, -70, -30, -60, -59, -50, -76, -74, -86, -78, -76, -91, -60, -66, -83, -77, -78, -68, -75, -78, -81, -70, -65, -70, -69, -73, -70, -61, -75, -77, -69, -78, -81, -68, -95, -92, -84, -97, -104, -94, -96, -95, -99, -92, -105, -97]
		
		mockGlobal.resultImgArr = [];
	});

	/**
	 *
	 */
	it('should respond properly to undefined msg', function () {
		mockGlobal.onmessage('unknown');
		expect(mockGlobal.postMessage).toHaveBeenCalledWith({
			'status': {
				'type': 'ERROR',
				'message': 'Undefined message was sent to spectroDrawingWorker'
			}
		});
	});

	/**
	 *
	 */
	it('should respond properly to defined msg with unknown cmd', function () {
		mockGlobal.onmessage({
			data: {
				data: 'unknown'
			}
		});
		expect(mockGlobal.postMessage).toHaveBeenCalledWith({
			'status': {
				'type': 'ERROR',
				'message': 'heatMapColorAnchors is undefined'
			}
		});
	});

	/**
	 *
	 */
	it('should set all global variables if onmessage() called with correct parameters', function () {

		mockGlobal.renderSpectrogram = jasmine.createSpy('renderSpectrogram');

		mockGlobal.onmessage({
			data: mockData
		}, [mockData.audioBuffer]);

		expect(mockGlobal.renderSpectrogram).toHaveBeenCalled();
		// global params
		expect(mockGlobal.windowSizeInSecs).toBe(mockData.windowSizeInSecs);
		expect(mockGlobal.N).toBe(mockData.fftN);
		expect(mockGlobal.internalalpha).toBe(mockData.alpha);
		expect(mockGlobal.upperFreq).toBe(mockData.upperFreq);
		expect(mockGlobal.lowerFreq).toBe(mockData.lowerFreq);
		expect(mockGlobal.samplesPerPxl).toBe(mockData.samplesPerPxl);
		expect(mockGlobal.wFunction).toBe(mockData.window);
		expect(mockGlobal.imgWidth).toBe(mockData.imgWidth);
		expect(mockGlobal.imgHeight).toBe(mockData.imgHeight);
		expect(mockGlobal.dynRangeInDB).toBe(mockData.dynRangeInDB);
		expect(mockGlobal.pixelRatio).toBe(mockData.pixelRatio);
		expect(mockGlobal.sampleRate).toBe(mockData.sampleRate);
		expect(mockGlobal.audioBufferChannels).toBe(mockData.audioBufferChannels);
		expect(mockGlobal.transparency).toBe(mockData.transparency);
		expect(mockGlobal.audioBuffer[0]).toBe(mockData.audioBuffer[0]);
		expect(mockGlobal.drawHeatMapColors).toBe(mockData.drawHeatMapColors);
		expect(mockGlobal.preEmphasisFilterFactor).toBe(mockData.preEmphasisFilterFactor);
		expect(mockGlobal.heatMapColorAnchors).toBe(mockData.heatMapColorAnchors);
	});

	/**
	 *
	 */
	it('should calculate toLinearLevel correctly', function () {
		var res = mockGlobal.toLinearLevel(6);
		expect(res).toBeCloseTo(3.981072, 4);

		res = mockGlobal.toLinearLevel(12);
		expect(res).toBeCloseTo(15.84893, 4);

		res = mockGlobal.toLinearLevel(22);
		expect(res).toBeCloseTo(158.4893, 4);
	});

	/**
	 *
	 */
	it('should calculate log10 correctly', function () {
		var res = mockGlobal.log10(6);
		expect(res).toBeCloseTo(0.7781513, 4);

		res = mockGlobal.log10(12);
		expect(res).toBeCloseTo(1.079181, 4);

		res = mockGlobal.log10(22);
		expect(res).toBeCloseTo(1.342423, 4);
	});

	/**
	 *
	 */
	it('should calculate magnitude correctly', function () {
		var res = mockGlobal.magnitude(1, 2);
		expect(res).toBeCloseTo(2.236068, 4);

		res = mockGlobal.magnitude(5, 3);
		expect(res).toBeCloseTo(5.830952, 4);
	});

	////////////////////////////////////
	// start: test window functions

	/**
	 *
	 */
	it('should calculate correct bartlett window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionBartlett(windowData.length, i);
		}

		expect(windowData[5]).toBeCloseTo(0.5263158, 4);
		expect(windowData[10]).toBeCloseTo(0.9473684, 4);
		expect(windowData[15]).toBeCloseTo(0.4210526, 4);

	});

	/**
	 *
	 */
	it('should calculate correct bartlettHann window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionBartlettHann(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.5376959, 4);
		expect(windowData[10]).toBeCloseTo(0.9821857, 4);
		expect(windowData[15]).toBeCloseTo(0.3877681, 4);

	});

	/**
	 *
	 */
	it('should calculate correct blackman window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionBlackman(windowData.length, i, mockData.alpha);
		}
		expect(windowData[5]).toBeCloseTo(0.3823808, 4);
		expect(windowData[10]).toBeCloseTo(0.988846, 4);
		expect(windowData[15]).toBeCloseTo(0.2268994, 4);

	});

	/**
	 *
	 */
	it('should calculate correct cosine window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionCosine(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.7357239, 4);
		expect(windowData[10]).toBeCloseTo(0.9965845, 4);
		expect(windowData[15]).toBeCloseTo(0.6142127, 4);

	});

	/**
	 *
	 */
	it('should calculate correct gauss window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionGauss(windowData.length, i, mockData.alpha);
		}
		expect(windowData[5]).toBeCloseTo(0.01249586, 4);
		expect(windowData[10]).toBeCloseTo(0.9473344, 4);
		expect(windowData[15]).toBeCloseTo(0.001435151, 4);

	});

	/**
	 *
	 */
	it('should calculate correct hamming window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionHamming(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.5779865, 4);
		expect(windowData[10]).toBeCloseTo(0.9937262, 4);
		expect(windowData[15]).toBeCloseTo(0.4270767, 4);

	});

	/**
	 *
	 */
	it('should calculate correct hann window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionHann(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.5412897, 4);
		expect(windowData[10]).toBeCloseTo(0.9931807, 4);
		expect(windowData[15]).toBeCloseTo(0.3772573, 4);

	});


	/**
	 *
	 */
	it('should calculate correct lanczos window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionLanczos(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.6696924, 4);
		expect(windowData[10]).toBeCloseTo(0.9954496, 4);
		expect(windowData[15]).toBeCloseTo(0.532984, 4);

	});

	/**
	 *
	 */
	it('should calculate correct rectangular window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionRectangular(windowData.length, i);
		}
		expect(windowData[5]).toBe(1);
		expect(windowData[10]).toBe(1);
		expect(windowData[15]).toBe(1);

	});

	/**
	 *
	 */
	it('should calculate correct Triangular window', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();
		for (var i = 0; i < windowData.length; i++) {
			windowData[i] *= mockGlobal.myFFT.wFunctionTriangular(windowData.length, i);
		}
		expect(windowData[5]).toBeCloseTo(0.55, 4);
		expect(windowData[10]).toBeCloseTo(0.95, 4);
		expect(windowData[15]).toBeCloseTo(0.45, 4);

	});

	// end: test window functions
	/////////////////////////////////

	/**
	 *
	 */
	it('should apply preemphasis correctly', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();

		var res = mockGlobal.myFFT.applyPreEmph(100, 50);
		expect(res).toBe(51.5)

		res = mockGlobal.myFFT.applyPreEmph(50, 100);
		expect(res).toBe(-47);

	});


	/**
	 *
	 */
	it('should calculate fft correctly', function () {

		mockGlobal.N = 512;
		mockGlobal.myFFT = new mockGlobal.FFT();

		var imag = new Float32Array(mockData.fftN);

		var real = new Float32Array(mockData.fftN);

		for (var j = 0; j < samples.length; j++) {
			real[j] = samples[j];
		}

		mockGlobal.myFFT.fft(real, imag);

		expect(real[0]).toBeCloseTo(-4196.00000, 4);

		expect(real[1]).toBeCloseTo(-2551.42727, 2);
		expect(imag[1]).toBeCloseTo(3224.107843, 3);
		expect(real[100]).toBeCloseTo(-30.04602, 4);
		expect(imag[100]).toBeCloseTo(26.566480, 4);
		expect(real[200]).toBeCloseTo(182.22050, 4);
		expect(imag[200]).toBeCloseTo(83.981800, 4);
		expect(real[250]).toBeCloseTo(4.35428, 4);
		expect(imag[250]).toBeCloseTo(30.942623, 4);

	});

	/**
	 *
	 */
	it('should convertToHeatmap', function () {
		var ret = mockGlobal.convertToHeatmap(1, 10, 5, [[255, 0, 0],[0, 255, 0],[0, 0, 255]]);
		expect(ret).toEqual({r: 28, g: 226, b: 0});
		var ret = mockGlobal.convertToHeatmap(1, 10, 5, [[128, 0, 0],[0, 128, 0],[0, 0, 128]]);
		expect(ret).toEqual({r: 14, g: 113, b: 0 });
	});

	/**
	 *
	 */
	it('should drawVerticalLineOfSpectogram and pixelHeight>1', function () {
    	mockGlobal.N = 512;
    	mockGlobal.pixelHeight = 5;
    	mockGlobal.paint = [samples, samples, samples, samples, samples];
		mockGlobal.drawVerticalLineOfSpectogram(0);
		expect(mockGlobal.resultImgArr).toEqual([0, 0, 0, 0]);
	});

	/**
	 *
	 */
	it('should drawVerticalLineOfSpectogram and pixelHeight<1', function () {
    	mockGlobal.N = 512;
    	mockGlobal.pixelHeight = 0.25;
    	mockGlobal.paint = [samples, samples, samples, samples, samples];
		mockGlobal.drawVerticalLineOfSpectogram(0);
		expect(mockGlobal.resultImgArr).toEqual([0, 0, 0, 0]);
	});

	/**
	 *
	 */
	it('should drawVerticalLineOfSpectogram with heatmaps', function () {
    	mockGlobal.N = 512;
    	mockGlobal.pixelHeight = 5;
    	mockGlobal.drawHeatMapColors = true;    	
    	mockGlobal.paint = [samples, samples, samples];
		mockGlobal.drawVerticalLineOfSpectogram(0);
		expect(mockGlobal.resultImgArr).toEqual([255, 0, 0, 0]);
	});
	
	// TODO: write tests for renderSpectrogram, calcMagnitudeSpectrum and 
	// probably getWorkerURL, kill, tell, says

});