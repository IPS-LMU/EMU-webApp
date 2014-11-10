/**
 * A simple class that creates another thread
 * which does the spectroDrawingWorker work
 * @class spectroDrawingWorker
 * @constructor
 * @param Worker {Worker} injection point for Worker
 */
function spectroDrawingWorker(Worker) {
  Worker = Worker || window.Worker;
  this.url = this.getWorkerURL();
  this.worker = new Worker(this.url);
}
 
spectroDrawingWorker.prototype = {
  // get the worker script in string format.
  getWorkerScript: function(){
    var js = '';
    js += '(' + this.workerInit + ')(this);';
    return js;
  },
 
  // This function really represents the body of our worker script.
  // The global context of the worker script will be passed in.
  workerInit: function(global) {

	/**
	 * A handy web worker to draw a spectrom (and calculate a fft)
	 *
	 * @version 1.2
	 * @author Georg Raess <georg.raess@campus.lmu.de>
	 * @link http://www.phonetik.uni-muenchen.de/
	 *
	 */
	 global.executed = false;
	 global.PI = 3.141592653589793; // value : Math.PI
	 global.TWO_PI = 6.283185307179586; // value : 2 * Math.PI
	 global.totalMax = 0;
	 global.dynRangeInDB = 50;
	 global.myWindow = {
		BARTLETT: 1,
		BARTLETTHANN: 2,
		BLACKMAN: 3,
		COSINE: 4,
		GAUSS: 5,
		HAMMING: 6,
		HANN: 7,
		LANCZOS: 8,
		RECTANGULAR: 9,
		TRIANGULAR: 10
	  };
	  global.width = 0;
	  global.height = 0;
	  global.upperFreq = 0;
	  global.lowerFreq = 0;
	  global.pixelRatio = 1;
	  global.heatMapColorAnchors = [
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 0]
	  ];
	  global.pcmpp = 0;
	  global.sampleRate = 0;
	  global.preEmphasisFilterFactor = 0.97;
	  global.transparency = 0;
	  global.drawHeatMapColors = false;
	  global.N = 0;
	  global.threadSoundBuffer = undefined;
	  global.streamChannels = 0;
	  global.wFunction = 0;
	  global.myFFT = undefined;
	  global.pixelHeight = 1;
	  global.internalalpha = 1;
	  global.maxPsd = 0;
	  global.HzStep = 0;
	  global.paint = [];
	  global.sin = undefined;
	  global.cos = undefined;
	  global.c = 0;	
	  global.d = 0;	
	  global.imageResult = undefined;

	/**
	 *various helper functions for calculation
	 */

	// used by FFT
	global.toLinearLevel = function(dbLevel) {
		return Math.pow(10, (dbLevel / 10));
	}

	// used by FFT
	global.log10 = function(arg) {
		return Math.log(arg) / 2.302585092994046; // Math.log(x) / Math.LN10
	}

	// used by FFT
	global.magnitude = function(real, imag) {
		return Math.sqrt((real * real) + (imag * imag));
	}

	/**
	 * calculates Magnitude by
	 * - reading the current (defined with offset) data from localSoundBuffer
	 * - applying the current Window Function to the selected data
	 * - calculating the actual FFT
	 * - (and saving the biggest value in totalMax)
	 *
	 * [parameters]
	 * channel			-> Number of Channels
	 * offset			-> Calculated offset in PCM Stream
	 * windowSize		-> Size of Window used for calculation
	 * c				-> Upper Boundry (c = Math.floor(upperFreq/HzStep);)
	 *
	 * [return]
	 * calculated FFT data as Float32Array
	 */
	 global.getMagnitude = function(offset) {
		// imaginary array of length N
		var imag = new Float32Array(global.N);

		// real array of length N
		var real = new Float32Array(global.N);

		// result array of length c - d
		var result = new Float32Array(global.c - global.d);

		// set real values by reading local sound buffer
		for (var j = 0; j <  global.N; j++) {
			real[j] = global.threadSoundBuffer[offset + j];
		}

		// calculate FFT window function over real 
		global.myFFT.wFunction(global.wFunction, global.internalalpha, real);

		// calculate FFT over real and save to result
		global.myFFT.fft(real, imag);
		// calculate magnitude for each spectral component 
		for (var low = 0; low <= global.c - global.d; low++) {
			result[low] = global.magnitude(real[low + global.d], imag[low + global.d]);
			if (global.totalMax < result[low]) {
				global.totalMax = result[low];
			}
		}
		return result;
	};

	/**
	 * interpolates a 3D color space and calculate accoring
	 * value on that plane
	 *
	 * @param minval is the minimum value to map to (number)
	 * @param maxval is the maximum value to map to (number)
	 * @param val is the value itself (number)
	 * @param colors is an array of arrays containing the colors
	 * to interpol. against (of the form: [[255, 0, 0],[0, 255, 0],[0, 0, 255]])
	 */
	 global.convertToHeatmap = function(minval, maxval, val, colors) {
		var maxIndex = colors.length - 1;
		var v = (val - minval) / (maxval - minval) * maxIndex;
		var i1 = Math.floor(v);
		var i2 = Math.min.apply(null, [Math.floor(v) + 1, maxIndex]);
		var rgb1 = colors[i1];
		var rgb2 = colors[i2];
		var f = v - i1;
		return ({
			'r': Math.floor(rgb1[0] + f * (rgb2[0] - rgb1[0])),
			'g': Math.floor(rgb1[1] + f * (rgb2[1] - rgb1[1])),
			'b': Math.floor(rgb1[2] + f * (rgb2[2] - rgb1[2]))
		});
	}


	/**
	 * draws a single Line on the Canvas Element
	 * by calculating the RGB value of the current pixel with:
	 * 255-(255*scaled)
	 * function has to be called in an outer loop (according to canvas_width)
	 * the inner loop draws a single line on the canvas (according to canvas_height)
	 * @param line is the calculated FFT data
	 * @param p 
	 * @param c 
	 * @param d 
	 * @param cacheOffet 
	 *
	 */
	 global.drawOfflineSpectogram = function(line) {

		// set upper boundary for linear interpolation
		var x1 = global.pixelHeight;
		var rgb, index, px, py;
		// value for first interpolation at lower boundry (height=0)
		var psd = (2 * Math.pow(global.paint[line][1], 2)) / global.N;
		var psdLog = 10 * global.log10(psd / global.maxPsd);
		var scaledVal = ((psdLog + global.dynRangeInDB) / global.dynRangeInDB);
		if (scaledVal > 1) {
			scaledVal = 1;
		} else if (scaledVal < 0) {
			scaledVal = 0;
		}

		for (var i = 0; i < global.paint[line].length; i++) {

			var y0 = scaledVal; // !!!! set y0 to previous scaled value

			// for each value in paint[] calculate pixelHeight interpolation points
			// x0=0
			// x1=pixelHeight
			// if(paint[i-1]<0) paint[i-1] = 1
			// y0=paint[i-1]    
			// y1=paint[i]


			// !!!! calculate next scaledValue [0...1] 
			psd = (2 * Math.pow(global.paint[line][i], 2)) / global.N;
			psdLog = 10 * global.log10(psd / global.maxPsd);
			scaledVal = ((psdLog + global.dynRangeInDB) / global.dynRangeInDB);
			if (scaledVal > 1) {
				scaledVal = 1;
			}
			if (scaledVal < 0) {
				scaledVal = 0;
			}

			// !!!! set y1 to this scaled value
			var y1 = scaledVal;

			if (global.pixelHeight >= 1) {
				// do interpolation between y0 (previous scaledValue) and y1 (scaledValue now)
				for (var b = 0; b < global.pixelHeight; b++) {
					var y2 = y0 + (y1 - y0) / x1 * b;

					// calculate corresponding color value for interpolation point [0...255]
					rgb = 255 - Math.round(255 * y2);

					// set internal image buffer to calculated & interpolated value
					px = Math.floor(line);
					py = Math.floor(global.height - (global.pixelHeight * (i - 2) + b));

					index = (px + (py * global.width)) * 4;
					if (global.drawHeatMapColors) {
						if (!isNaN(rgb)) {
							var hmVals = global.convertToHeatmap(0, 255, rgb, global.heatMapColorAnchors);
							global.imageResult[index + 0] = hmVals.r;
							global.imageResult[index + 1] = hmVals.g;
							global.imageResult[index + 2] = hmVals.b;
							global.imageResult[index + 3] = global.transparency;

						} else {
							global.imageResult[index + 0] = rgb;
							global.imageResult[index + 1] = rgb;
							global.imageResult[index + 2] = rgb;
							global.imageResult[index + 3] = global.transparency;
						}

					} else {
						global.imageResult[index + 0] = rgb;
						global.imageResult[index + 1] = rgb;
						global.imageResult[index + 2] = rgb;
						global.imageResult[index + 3] = global.transparency;
					}
				}
			} else {
				rgb = 255 - Math.round(255 * y1);
				// set internal image buffer to calculated & interpolated value
				px = Math.floor(line);
				py = Math.floor(global.height - (global.pixelHeight * (i - 2)));

				index = (px + (py * global.width)) * 4;
				global.imageResult[index + 0] = rgb;
				global.imageResult[index + 1] = rgb;
				global.imageResult[index + 2] = rgb;
				global.imageResult[index + 3] = global.transparency;
			}
		}
	}

	/**
	 * the actual FFT calculation including all window 
	 * functions
	 *
	 * @param fftSize is the actual size of the FFT
	 *
	 */
	 global.FFT = function() {
		var m, i, x;
		var n = global.N;
		m = parseInt((Math.log(n) / 0.6931471805599453), 10);
		if (n !== (1 << m)) { // Make sure n is a power of 2
			console.log('ERROR : FFT length must be power of 2');
		}
		if (global.cos === undefined || n !== global.N) {

			// this means that the following is only executed 
			// when no COS table exists
			// or n changes 

			global.cos = new Float32Array(n / 2); // precompute cos table
			for (x = 0; x < n / 2; x++) {
				global.cos[x] = Math.cos(-2 * global.PI * x / n);
			}
		}
		if (global.sin === undefined || n !== global.N) {

			// this means that the following is only executed 
			// when no COS table exists
			// or n changes 

			global.sin = new Float32Array(n / 2); // precompute sin table
			for (x = 0; x < n / 2; x++) {
				global.sin[x] = Math.sin(-2 * global.PI * x / n);
			}
		}

		/**
		 * choose window function set alpha and execute it on the buffer
		 *
		 * @param type is the chosen window Function as enmu
		 * @param alpha is the alpha value for Window Functions (default 0.16)
		 * @param buffer represents the current fft window data
		 * @return the calculated FFT window
		 */
		this.wFunction = function (type, alpha, buffer) {
			var length = buffer.length;
			this.alpha = alpha;
			switch (type) {
				case global.myWindow.BARTLETT:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionBartlett(length, i);
					}
					break;
				case global.myWindow.BARTLETTHANN:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionBartlettHann(length, i);
					}
					break;
				case global.myWindow.BLACKMAN:
					this.alpha = this.alpha || 0.16;
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionBlackman(length, i, alpha);
					}
					break;
				case global.myWindow.COSINE:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionCosine(length, i);
					}
					break;
				case global.myWindow.GAUSS:
					this.alpha = this.alpha || 0.25;
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionGauss(length, i, alpha);
					}
					break;
				case global.myWindow.HAMMING:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionHamming(length, i);
					}
					break;
				case global.myWindow.HANN:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionHann(length, i);
					}
					break;
				case global.myWindow.LANCZOS:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionLanczos(length, i);
					}
					break;
				case global.myWindow.RECTANGULAR:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionRectangular(length, i);
					}
					break;
				case global.myWindow.TRIANGULAR:
					for (i = 0; i < length; i++) {
						if (i > 0) {
							buffer[i] = this.applyPreEmph(buffer[i], buffer[i - 1]);
						}
						buffer[i] *= this.wFunctionTriangular(length, i);
					}
					break;
			}
			return buffer;
		};

		// the Window Functions

		this.wFunctionBartlett = function (length, index) {
			return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
		};

		this.wFunctionBartlettHann = function (length, index) {
			return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(global.TWO_PI * index / (length - 1));
		};

		this.wFunctionBlackman = function (length, index, alpha) {
			var a0 = (1 - alpha) / 2;
			var a1 = 0.5;
			var a2 = alpha / 2;
			return a0 - a1 * Math.cos(global.TWO_PI * index / (length - 1)) + a2 * Math.cos(4 * global.PI * index / (length - 1));
		};

		this.wFunctionCosine = function (length, index) {
			return Math.cos(global.PI * index / (length - 1) - global.PI / 2);
		};

		this.wFunctionGauss = function (length, index, alpha) {
			return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
		};

		this.wFunctionHamming = function (length, index) {
			return 0.54 - 0.46 * Math.cos(global.TWO_PI * index / (length - 1));
		};

		this.wFunctionHann = function (length, index) {
			return 0.5 * (1 - Math.cos(global.TWO_PI * index / (length - 1)));
		};

		this.wFunctionLanczos = function (length, index) {
			var x = 2 * index / (length - 1) - 1;
			return Math.sin(global.PI * x) / (global.PI * x);
		};

		this.wFunctionRectangular = function () {
			return 1;
		};

		this.wFunctionTriangular = function (length, index) {
			return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
		};
		/**
		 * calculate and apply according pre-emphasis on sample
		 */
		this.applyPreEmph = function (curSample, prevSample) {
			return curSample - global.preEmphasisFilterFactor * prevSample;
		};

		// the FFT calculation
		this.fft = function (x, y) {
			// Bit-reverse
			var i, j, k, n1, n2, a, c, s, t1, t2;
			// Bit-reverse
			j = 0;
			n2 = n / 2;
			for (i = 1; i < n - 1; i++) {
				n1 = n2;
				while (j >= n1) {
					j = j - n1;
					n1 = n1 / 2;
				}
				j = j + n1;

				if (i < j) {
					t1 = x[i];
					x[i] = x[j];
					x[j] = t1;
					t1 = y[i];
					y[i] = y[j];
					y[j] = t1;
				}
			}

			// FFT
			n1 = 0;
			n2 = 1;

			for (i = 0; i < m; i++) {
				n1 = n2;
				n2 = n2 + n2;
				a = 0;

				for (j = 0; j < n1; j++) {
					c = global.cos[a];
					s = global.sin[a];
					a += 1 << (m - i - 1);

					for (k = j; k < n; k = k + n2) {
						t1 = c * x[k + n1] - s * y[k + n1];
						t2 = s * x[k + n1] + c * y[k + n1];
						x[k + n1] = x[k] - t1;
						y[k + n1] = y[k] - t2;
						x[k] = x[k] + t1;
						y[k] = y[k] + t2;
					}
				}
			}
		};
	}



	/**
	 * initial function call for calculating and drawing Spectrogram
	 * input sample data comes from the buffer "localSoundBuffer"
	 * which has to be filled before.
	 * - first loop calculates magnitudes to draw (getMagnitude())
	 * - second loop draws values on canvas  (drawOfflineSpectogram())
	 *
	 * @param cWidth is the width of canvas element
	 * @param cHeightis the height of canvas element
	 * @param octxis the context of canvas element used for drawing
	 */
	 global.parseData = (function () {
		return function () {

			if (!global.executed) {
				// start execution once
				global.executed = true;

				// instance of FFT with windowSize N
				global.myFFT = new global.FFT();

				// array holding FFT results paint[canvas width][canvas height]
				global.paint = new Array(global.width);

				// Hz per pixel height
				global.HzStep = (global.sampleRate / 2) / (global.N / 2);

				// upper Hz boundary to display
				global.c = Math.ceil(global.upperFreq / global.HzStep);

				// lower Hz boundary to display
				global.d = Math.floor(global.lowerFreq / global.HzStep); // -1 for value below display when lower>0

				// height between two interpolation points
				global.pixelHeight = global.height / (global.c - global.d - 2);

				// ugly hack in order to support PhantomJS < 2.0 testing
				if (typeof Uint8ClampedArray == "undefined") {
				    Uint8ClampedArray = Uint8Array;
				}
				// create new picture
				global.imageResult = new Uint8ClampedArray(Math.ceil(global.width * global.height * 4));

				// calculate i FFT runs, save result into paint and set maxPsd while doing so
				for (var i = 0; i < global.width; i++) {
					global.paint[i] = global.getMagnitude(Math.round(i * global.pcmpp));
					global.maxPsd = (2 * Math.pow(global.totalMax, 2)) / global.N;
				}

				// draw spectrogram on png image with canvas width
				// one column is drawn per drawOfflineSpectogram
				for (var j = 0; j < global.width; j++) {
					global.drawOfflineSpectogram(j);
				}

				// post generated image block with settings back
				global.postMessage({
					'window': global.wFunction,
					'pcmpp': global.pcmpp,
					'pixelHeight': global.pixelHeight,
					'pixelRatio': global.pixelRatio,
					'width': global.width,
					'height': global.height,
					'img': global.imageResult.buffer
				}, [global.imageResult.buffer]);

				// free vars
				global.myFFT = null;

				// stop execution
				global.executed = false;
			}
		};
	})();

	global.onmessage = function(e) {
		if(e.data !== undefined) {
			var render = true;
			var renderError = '';
			var data = e.data;
			if (data.N !== undefined) {
				global.N = data.N;
			} else {
				renderError = 'N';
				render = false;
			}
			if (data.alpha !== undefined) {
				global.internalalpha = data.alpha;
			} else {
				renderError = 'alpha';
				render = false;		    
			}
			if (data.freq !== undefined) {
				global.upperFreq = data.freq;
			} else {
				renderError = 'freq';
				render = false;	
			}
			if (data.freqLow !== undefined) {
				global.lowerFreq = data.freqLow;
			} else {
				renderError = 'freqLow';
				render = false;			    
			}
			if (data.pcmpp !== undefined) {
				global.pcmpp = data.pcmpp;
			} else {
				renderError = 'pcmpp';
				render = false;			    
			}
			if (data.window !== undefined) {
				switch (data.window) {
				case 1:
					global.wFunction = global.myWindow.BARTLETT;
					break;
				case 2:
					global.wFunction = global.myWindow.BARTLETTHANN;
					break;
				case 3:
					global.wFunction = global.myWindow.BLACKMAN;
					break;
				case 4:
					global.wFunction = global.myWindow.COSINE;
					break;
				case 5:
					global.wFunction = global.myWindow.GAUSS;
					break;
				case 6:
					global.wFunction = global.myWindow.HAMMING;
					break;
				case 7:
					global.wFunction = global.myWindow.HANN;
					break;
				case 8:
					global.wFunction = global.myWindow.LANCZOS;
					break;
				case 9:
					global.wFunction = global.myWindow.RECTANGULAR;
					break;
				case 10:
					global.wFunction = global.myWindow.TRIANGULAR;
					break;
				}
			} else {
				renderError = 'window';
				render = false;	
			}
			if (data.width !== undefined) {
				global.width = data.width;
			} else {
				renderError = 'width';
				render = false;	
			}
			if (data.height !== undefined) {
				global.height = data.height;
			} else {
				renderError = 'height';
				render = false;	
			}
			if (data.dynRangeInDB !== undefined) {
				global.dynRangeInDB = data.dynRangeInDB;
			} else {
				renderError = 'dynRangeInDB';
				render = false;	
			}
			if (data.pixelRatio !== undefined) {
				global.pixelRatio = data.pixelRatio;
			} else {
				renderError = 'pixelRatio';
				render = false;	
			}
			if (data.sampleRate !== undefined) {
				global.sampleRate = data.sampleRate;
			} else {
				renderError = 'sampleRate'; 
				render = false;	
			}
			if (data.streamChannels !== undefined) {
				global.streamChannels = data.streamChannels;
			} else {
				renderError = 'streamChannels';
				render = false;	
			}
			if (data.transparency !== undefined) {
				global.transparency = data.transparency;
			} else {
				renderError = 'transparency';
				render = false;	
			}
			if (data.stream !== undefined) {
				global.threadSoundBuffer = new Float32Array(data.stream);
			} else {
				renderError = 'stream';
				render = false;	
			}
			if (data.drawHeatMapColors !== undefined) {
				global.drawHeatMapColors = data.drawHeatMapColors;
			} else {
				renderError = 'drawHeatMapColors';
				render = false;	
			}
			if (data.preEmphasisFilterFactor !== undefined) {
				global.preEmphasisFilterFactor = data.preEmphasisFilterFactor;
			} else {
				renderError = 'preEmphasisFilterFactor';
				render = false;	
			}
			if (data.heatMapColorAnchors !== undefined) {
				global.heatMapColorAnchors = data.heatMapColorAnchors;
			} else {
				renderError = 'heatMapColorAnchors';
				render = false;	
			}
			if(render) {
				global.parseData();
			} else {
				global.postMessage({
				  'status': {
					'type': 'ERROR',
					'message': renderError + ' is undefined'
				  }
				});		
			}
		}
		else {
			global.postMessage({
				'status': {
					'type': 'ERROR',
					'message': 'Undefined message was sent to spectroDrawingWorker'
				}
			});
		}
	};    
  },
 
  
  // get a blob url for the worker script from the worker script text
  getWorkerURL: function() {
    var blob, urlObj;
	try {
		blob = new Blob([this.getWorkerScript()], {type: 'application/javascript'});
	} catch (e) { // Backwards-compatibility
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		blob = new BlobBuilder();
		blob.append(spectroDrawingWorker);
		blob = blob.getBlob();
	}
	if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
		urlObj = webkitURL.createObjectURL(blob);
	} else {
		urlObj = URL.createObjectURL(blob);
	} 
	return urlObj;
  },
 
 
  // kill the spectroDrawingWorker
  kill: function() {
    if(this.worker) {
      this.worker.terminate();
    }
    if(this.url) {
		if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
			webkitURL.revokeObjectURL(this.url);
		} else {
			URL.revokeObjectURL(this.url);
		} 
    }
  },
  
  // say something to the spectroDrawingWorker
  tell: function(msg) {
    if(this.worker) {
      this.worker.postMessage(msg);
    }
  },
  
  // listen for the spectroDrawingWorker to talk back
  says: function(handler) {
    if(this.worker) {
      this.worker.addEventListener('message', function(e) {
        handler(e.data);
      });
    }
  },
};