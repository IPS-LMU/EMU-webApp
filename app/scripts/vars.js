    //
    // Main Configuration File 
    //
    
    // available window functions 
	var myWindow = {
  		BARTLETT:       1,
  		BARTLETTHANN:   2,
  		BLACKMAN:       3,
  		COSINE:         4,
  		GAUSS:          5,
  		HAMMING:        6,
  		HANN:           7,
  		LANCZOS:        8,
  		RECTANGULAR:    9,
  		TRIANGULAR:     10
  	} 
  	
  	// various mathematical vars
   	var PI = 3.141592653589793;						// value : Math.PI
  	var TWO_PI = 6.283185307179586;					// value : 2 * Math.PI
	var OCTAVE_FACTOR=3.321928094887363; 			// value : 1.0/log10(2)	
	var emphasisPerOctave=3.9810717055349722;		// value : toLinearLevel(6);		
	var dynamicRange=5000;							// value : toLinearLevel(50);
	var dynRangeInDB=50;							// value : toLevelInDB(dynamicRange);    

	// FFT default vars
	var N = 512;									// default FFT Window Size
	var alpha = 0.16;								// default alpha for Window Function
    var windowFunction = myWindow.BARTLETTHANN;		// default Window Function
    var sampleRate = 44100;							// default sample rate
    var channels = 1;								// default number of channels
    var freq = 8000;								// default upper Frequency
    var sampleRate = 44100;							// default sample Rate
    var start = 0;						// prozentual / Umrechnung in getPacketInPercent
    var end = 100;						// prozentual / Umrechnung in getPacketInPercent
    
    // design vars
    var background_color = 0x00;					// default background of image -> black
    
    // various vars used during calculation...
    // do not change unless you know what you are doing =)
	var executed = false;							// boolean for single execution of parseData
    var pixel_height = 1;							// default pixel height per value
    var totalMax = 0;								// total max during fft calculation
    
    // various vars
    var localSoundBuffer, HzStep, c, real, image, result, myImage,
    sampleStart, sampleEnd, packetCountStartEnd, completeLength, myStep, myoctx, p,
    N,upperFreq,start,end,c_width,c_height,myFFT;
    
    // local sound buffer
    var threadSoundBuffer;
    
    // interpolation var
    var x0 = 0;
    
    var js_spectro_filename = 'js/spectrogram.js';
    var canvas_spectro_name = 'spectrogram';
   

