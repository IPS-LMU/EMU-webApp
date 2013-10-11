'use strict';


angular.module('emulvcApp')
	.directive('spectro', function() {
		return {
			templateUrl: 'views/spectro.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				// select the needed DOM elements from the template
				var canvas = element.find("canvas");
				var myid = element[0].id;
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
            var PI = 3.141592653589793;                        // value : Math.PI
            var TWO_PI = 6.283185307179586;                    // value : 2 * Math.PI
            var OCTAVE_FACTOR=3.321928094887363;               // value : 1.0/log10(2)	
            var emphasisPerOctave=3.9810717055349722;          // value : toLinearLevel(6);		
            var dynamicRange=5000;                             // value : toLinearLevel(50);
            var dynRangeInDB=50;                               // value : toLevelInDB(dynamicRange);    
            var params = params;
        // FFT default vars
            var N = 512;                                       // default FFT Window Size
            var alpha = 0.16;                                  // default alpha for Window Function
            var windowFunction =    myWindow.BARTLETTHANN;     // default Window Function
            var sampleRate = 44100;                            // default sample rate
            var channels = 1;                                  // default number of channels
            var freq_lower = 0;                                // default upper Frequency
            var freq = 8000;                                   // default upper Frequency
            var context = canvas[0].getContext("2d");    
            var pcmperpixel = 0; 
            var myImage = new Image();
            var font = "Verdana";
            window.URL = window.URL || window.webkitURL;
            var devicePixelRatio = window.devicePixelRatio || 1;
            var response = spectroworker.textContent;
            var blob;
            try { var blob = new Blob([response], { "type" : "text\/javascript" }); }
            catch (e) { // Backwards-compatibility
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                blob.append(response);
                blob = blob.getBlob();
            }
            var primeWorker = new Worker(URL.createObjectURL(blob));
            //setupEvent();
            //clearImageCache();

			scope.$watch('vs.curViewPort', function() {
				drawOsci(scope.vs.curViewPort, canvas, scope.shs.currentBuffer);
			}, true);
				
				/**
				 * draw tier details
				 * @param tierDetails
				 * @param perx
				 * @param pery
				 */

				function drawOsci(viewState, canvas, buffer) {
					if ($.isEmptyObject(viewState)) {
						 console.log("undef viewState");
						return;
					}
					console.log(viewState);
				}
			}
		}
	});