'use strict';


angular.module('emulvcApp')
    .directive('spectro', function() {
        return {
            templateUrl: 'views/spectro.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                // select the needed DOM elements from the template
                var canvas = element.find("canvas")[0];
                var myid = element[0].id;
                var myWindow = {
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

                // various mathematical vars
                var PI = 3.141592653589793; // value : Math.PI
                var TWO_PI = 6.283185307179586; // value : 2 * Math.PI
                var OCTAVE_FACTOR = 3.321928094887363; // value : 1.0/log10(2)	
                var emphasisPerOctave = 3.9810717055349722; // value : toLinearLevel(6);		
                var dynamicRange = 5000; // value : toLinearLevel(50);
                var dynRangeInDB = 50; // value : toLevelInDB(dynamicRange);    
                // FFT default vars
                var N = 512; // default FFT Window Size
                var alpha = 0.16; // default alpha for Window Function
                var windowFunction = myWindow.BARTLETTHANN; // default Window Function
                var sampleRate = 44100; // default sample rate
                var channels = 1; // default number of channels
                var freq_lower = 0; // default upper Frequency
                var freq = 8000; // default upper Frequency
                var context = canvas.getContext("2d");
                var pcmperpixel = 0;
                var myImage = new Image();
                window.URL = window.URL || window.webkitURL;
                var devicePixelRatio = window.devicePixelRatio || 1;
                var response = spectroworker.textContent;
                var blob, vs;

                try { 
                    blob = new Blob([response], {
                        "type": "text\/javascript"
                    });
                } catch (e) { // Backwards-compatibility
                    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                    blob.append(response);
                    blob = blob.getBlob();
                }
                var primeWorker = new Worker(URL.createObjectURL(blob));
                var imageCache = null;
                var imageCacheCounter = 0;
                var ppp;
                var cache;
                
                setupEvent();
                clearImageCache();
                
                
                scope.$watch('vs.curViewPort', function() {
                    if (!$.isEmptyObject(cache)) {
                        if(cache!=null) drawTimeLine(cache);
                        //else drawOsci(scope.vs, scope.shs.currentBuffer);
                    }
                }, true);                   
                

                scope.$watch('vs', function() {
                    if (!$.isEmptyObject(scope.shs.currentBuffer)) {
                        ppp = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas.width);
                        cache = cacheHit(scope.vs.curViewPort.sS,scope.vs.curViewPort.eS,ppp);
                        if(cache!=null) {
                            drawTimeLine(cache);
                        }
                        else {
                            drawOsci(scope.vs, scope.shs.currentBuffer);
                        }
                    }
                }, true);                

                function clearImageCache() {
                    imageCache = null;
                    imageCacheCounter = 0;
                    imageCache = new Array();
                }

                function buildImageCache(cstart, cend, ppp, imgData) {
                    imageCache[imageCacheCounter] = new Array();
                    imageCache[imageCacheCounter][0] = cstart;
                    imageCache[imageCacheCounter][1] = cend;
                    imageCache[imageCacheCounter][2] = ppp;
                    imageCache[imageCacheCounter][3] = imgData;
                    ++imageCacheCounter;
                }
                
                function cacheHit(cstart, cend, ppp) {
                    for (var i = 0; i < imageCache.length; ++i) {
                        if (imageCache[i][0] == cstart &&
                            imageCache[i][1] == cend &&
                            imageCache[i][2] == ppp) {
                            return i;
                        }
                    }
                    return null;
                }                

                function drawTimeLineContext() {
					var posS = vs.getPos(canvas.width, vs.curViewPort.selectS);
					var posE = vs.getPos(canvas.width, vs.curViewPort.selectE);
					var sDist = vs.getSampleDist(canvas.width);
					var xOffset;        
					if (vs.curViewPort.selectS == vs.curViewPort.selectE) {
						// calc. offset dependant on type of tier of mousemove  -> default is sample exact
						if (vs.curMouseMoveTierType == "seg") {
							xOffset = 0;
						} else {
							xOffset = (sDist / 2);
						}
						context.fillStyle = scope.config.vals.colors.selectedBorderColor;
						context.fillRect(posS + xOffset, 0, 1, canvas.height);
						context.fillStyle = scope.config.vals.colors.labelColor;
						context.fillText(vs.round(vs.curViewPort.selectS / 44100 + (1 / 44100) / 2, 6), posS + xOffset + 5, scope.config.vals.colors.fontPxSize);
						context.fillText(vs.curViewPort.selectS, posS + xOffset + 5, scope.config.vals.colors.fontPxSize * 2);
					} else {
						context.fillStyle = scope.config.vals.colors.selectedAreaColor;
						context.fillRect(posS, 0, posE - posS, canvas.height);
						context.strokeStyle = scope.config.vals.colors.selectedBoundaryColor;
						context.beginPath();
						context.moveTo(posS, 0);
						context.lineTo(posS, canvas.height);
						context.moveTo(posE, 0);
						context.lineTo(posE, canvas.height);
						context.closePath();
						context.stroke();
						context.fillStyle = canvas.labelColor;
						// start values
						var tW = context.measureText(vs.curViewPort.selectS).width;
						context.fillText(vs.curViewPort.selectS, posS - tW - 4, scope.config.vals.colors.fontPxSize);
						tW = context.measureText(vs.round(vs.curViewPort.selectS / 44100, 6)).width;
						context.fillText(vs.round(vs.curViewPort.selectS / 44100, 6), posS - tW - 4, scope.config.vals.colors.fontPxSize * 2);
						// end values
						context.fillText(vs.curViewPort.selectE, posE + 5, scope.config.vals.colors.fontPxSize);
						context.fillText(vs.round(vs.curViewPort.selectE / 44100, 6), posE + 5, scope.config.vals.colors.fontPxSize * 2);
						// dur values
						// check if space
						if (posE - posS > context.measureText(vs.round((vs.curViewPort.selectE - vs.curViewPort.selectS) / 44100, 6)).width) {
							tW = context.measureText(vs.curViewPort.selectE - vs.curViewPort.selectS).width;
							context.fillText(vs.curViewPort.selectE - vs.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize);
							tW = context.measureText(vs.round((vs.curViewPort.selectE - vs.curViewPort.selectS) / 44100, 6)).width;
							context.fillText(vs.round(((vs.curViewPort.selectE - vs.curViewPort.selectS) / 44100), 6), posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize * 2);
						}
					}
                }



                function drawTimeLine(id) {
                    var image = new Image();
                    image.onload = function() {
                        context.drawImage(image, 0, 0);
                        drawTimeLineContext();
                    };
                    image.src = imageCache[id][3];
                }


                function killSpectroRenderingThread() {
                    context.fillStyle = "#222";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.font = "10px Verdana";
                    context.fillStyle = "#333";
                    context.fillText("loading...", 10, 25);
                    if (primeWorker != null) {
                        primeWorker.terminate();
                        primeWorker = null;
                    }
                }

                function setupEvent() {
                    ppp = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas.width);
                    primeWorker.addEventListener('message', function(event) {
                        var worker_img = event.data.img;
                        myImage.onload = function() {
                            context.drawImage(myImage, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                            buildImageCache(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, ppp,canvas.toDataURL("image/png"));
                            drawTimeLineContext();                            
                        }
                        myImage.src = worker_img;
                    });
                }

                function drawOsci(viewState, buffer) {
                    killSpectroRenderingThread();
                    startSpectroRenderingThread(viewState, buffer);
                }

                function startSpectroRenderingThread(viewState, buffer) {
                    vs = viewState;
                    pcmperpixel = Math.round((vs.curViewPort.eS - vs.curViewPort.sS) / canvas.width);
                    primeWorker = new Worker(URL.createObjectURL(blob));
                    var parseData = buffer.getChannelData(0).subarray(vs.curViewPort.sS, vs.curViewPort.eS + (2 * N));
                    setupEvent();

                    primeWorker.postMessage({
                        'cmd': 'config',
                        'N': N
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'alpha': alpha
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'freq': freq
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'freq_low': freq_lower
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'start': Math.round(viewState.sS)
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'end': Math.round(viewState.eS)
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'myStep': pcmperpixel
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'window': windowFunction
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'cacheSide': 0
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'width': canvas.width
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'height': canvas.height
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'cacheWidth': 0
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'dynRangeInDB': dynRangeInDB
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'pixelRatio': devicePixelRatio
                    });
                    primeWorker.postMessage({
                        'cmd': 'pcm',
                        'config': JSON.stringify(buffer)
                    });
                    primeWorker.postMessage({
                        'cmd': 'pcm',
                        'stream': parseData
                    });
                    primeWorker.postMessage({
                        'cmd': 'render'
                    });
                }


            }
        }
    });