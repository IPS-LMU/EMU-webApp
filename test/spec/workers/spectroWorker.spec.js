'use strict';

describe('Worker: spectroWorker', function () {

	var worker, worker2, binary;

	var start = 2000;
	var end = 5000;
	var windowLength = 256;
	var window = 5;
	var width = 2048;
	var height = 150;
	var step = 28.36;
	var pixelRatio = 0.9;
	var sampleRate = 20000;
	var freq = 5000;
	var freqLow = 0;

	// load the controller's module
	beforeEach(module('emuwebApp'));
	
	  beforeEach(inject(function() {
		var blob;
		  try {
			  blob = new Blob([spectroWorker], {type: 'application/javascript'});
		  } catch (e) { // Backwards-compatibility
			  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			  blob = new BlobBuilder();
			  blob.append(spectroWorker);
			  blob = blob.getBlob();
		 }
		 if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			 worker = new Worker(webkitURL.createObjectURL(blob));
		 } else {
			 worker = new Worker(URL.createObjectURL(blob));
		 }  
		 try {
			  blob = new Blob([wavParserWorker], {type: 'application/javascript'});
		  } catch (e) { // Backwards-compatibility
			  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
			  blob = new BlobBuilder();
			  blob.append(wavParserWorker);
			  blob = blob.getBlob();
		 }
		 if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			 worker2 = new Worker(webkitURL.createObjectURL(blob));
		 } else {
			 worker2 = new Worker(URL.createObjectURL(blob));
		 }		 
	  }));  	


	it('should return error on undefined paramater', function (done) {
		worker.addEventListener('message', function (e) {
			expect(e.data.status.type).toEqual('ERROR');
			expect(e.data.status.message).toEqual('heatMapColorAnchors is undefined');
			worker.terminate();
			done();
		});
		worker.postMessage('');
	});

	it('should render spectro image', inject(function (Binarydatamaniphelper) {
		if (navigator.userAgent.match(/PhantomJS/i) === null) {

			// first step : convert b64 to wav using workerFileWav
			var buf = Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
			worker2.postMessage({
				'cmd': 'parseBuf',
				'buffer': buf
			}, [buf]);

			// second step : send converted wav data to workerFileSpec
			worker2.addEventListener('message', function (e) {
				var wavData = new Float32Array(e.data.data.Data.subarray(start - windowLength / 2, end + windowLength));
				worker.postMessage({
					'N': windowLength,
					'alpha': 0.16,
					'freq': freq,
					'freqLow': freqLow,
					'start': start,
					'end': end,
					'myStep': step,
					'window': window,
					'width': width,
					'height': height,
					'dynRangeInDB': 70,
					'pixelRatio': pixelRatio,
					'sampleRate': sampleRate,
					'streamChannels': 1,
					'transparency': 255,
					'stream': wavData,
					'drawHeatMapColors': false,
					'preEmphasisFilterFactor': 0.97,
					'heatMapColorAnchors': JSON.parse('[[255,0,0],[0,255,0],[0,0,0]]')
				});
				worker2.terminate();
			});

			// third step : check if workerFileSpec generated spectro image
			// todo : eventually check if image is like it should be
			// right now : only parameters and image size are checked
			worker.addEventListener('message', function (e) {
				var typedArray = new Uint8Array(e.data.img);
				var normalArray = Array.prototype.slice.call(typedArray);
				expect(normalArray.length).toEqual(1228800);
				expect(e.data.start).toEqual(start);
				expect(e.data.end).toEqual(end);
				expect(e.data.window).toEqual(window);
				expect(e.data.myStep).toEqual(step);
				// calculate pixel Height
				var HzStep = (sampleRate / 2) / (windowLength / 2);
				var upperHz = Math.ceil(freq / HzStep);
				var lowerHz = Math.floor(freqLow / HzStep);
				var calcPixelHeight = height / (upperHz - lowerHz - 2);
				expect(e.data.pixelHeight).toEqual(calcPixelHeight);
				expect(e.data.renderWidth).toEqual(width);
				expect(e.data.renderHeight).toEqual(height);
				worker.terminate();
			});
		}

	}));
});