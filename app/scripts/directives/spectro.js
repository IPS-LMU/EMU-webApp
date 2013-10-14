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
                var imageCacheCounter = null;
                setupEvent();
                clearImageCache();

                scope.$watch('vs.curViewPort', function() {
                    if (!$.isEmptyObject(scope.shs.currentBuffer)) {
                        drawOsci(scope.vs, canvas, scope.shs.currentBuffer);
                    }
                }, true);

                function clearImageCache() {
                    imageCache = null;
                    imageCacheCounter = null;
                    imageCache = new Array();
                    imageCacheCounter = new Array();
                }

                function buildImageCache(cstart, cend, imgData) {
                    if (imageCache[pcmperpixel] == null)
                        imageCache[pcmperpixel] = new Array();

                    if (imageCacheCounter[pcmperpixel] == null)
                        imageCacheCounter[pcmperpixel] = 0;

                    if (imageCache[pcmperpixel][imageCacheCounter[pcmperpixel]] == null) {
                        imageCache[pcmperpixel][imageCacheCounter[pcmperpixel]] = new Array();
                        imageCache[pcmperpixel][imageCacheCounter[pcmperpixel]][0] = cstart;
                        imageCache[pcmperpixel][imageCacheCounter[pcmperpixel]][1] = cend;
                        imageCache[pcmperpixel][imageCacheCounter[pcmperpixel]][2] = imgData;
                        ++imageCacheCounter[pcmperpixel];
                    }
                }

                function drawTimeLineContext() {
                    var posS = vs.getPos(canvas.width, vs.curViewPort.selectS);
                    var posE = vs.getPos(canvas.width, vs.curViewPort.selectE);
                    var sDist = vs.getSampleDist(canvas.width) / 2;
                    var curPos = posS + sDist;
                    if (posS != 0 && vs.selectS == vs.selectE) {
                        context.fillStyle = "#000";
                        context.fillRect(curPos, 0, 1, canvas.height);
                    }
                    if (curPos != 0 && vs.selectS != vs.selectE) {
                        context.fillStyle = "#f00";
                        context.fillRect(posS, 0, posE - posS, canvas.height);
                        context.strokeStyle = "#111";
                        context.beginPath();
                        context.moveTo(posS, 0);
                        context.lineTo(posS, canvas.height);
                        context.moveTo(posE, 0);
                        context.lineTo(posE, canvas.height);
                        context.closePath();
                        context.stroke();
                    }
                }


                function drawTimeLine() {
                    var image = new Image();
                    image.onload = function() {
                        context.drawImage(image, 0, 0);
                        drawTimeLineContext();
                    };
                    image.src = this.myImage.src;
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
                    primeWorker.addEventListener('message', function(event) {
                        var worker_img = event.data.img;
                        var worker_start = event.data.start;
                        var worker_end = event.data.end;
                        var worker_cache_width = event.data.cacheWidth;
                        var worker_cache_side = event.data.cacheSide;
                        var render_width = canvas.width - worker_cache_width;
                        myImage.onload = function() {
                            if (worker_cache_side == 0)
                                context.drawImage(myImage, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                            if (worker_cache_side == 1)
                                context.drawImage(myImage, 0, 0, render_width, canvas.height, 0, 0, render_width, canvas.height);
                            if (worker_cache_side == 2)
                                context.drawImage(myImage, worker_cache_width, 0, render_width, canvas.height, worker_cache_width, 0, render_width, canvas.height);
                            buildImageCache(worker_start, worker_end, canvas.toDataURL("image/png"));
                            drawTimeLineContext();
                        }
                        myImage.src = worker_img;
                    });
                }

                function drawOsci(viewState, canvas, buffer) {
                    var newpcmperpixel = Math.round((viewState.eS - viewState.sS) / canvas.width);
                    if (imageCache != null) {
                        if (imageCache[newpcmperpixel] != null) {
                            for (var i = 0; i < imageCache[newpcmperpixel].length; ++i) {
                                // check for complete image
                                if (imageCache[newpcmperpixel][i][0] == viewState.sS &&
                                    imageCache[newpcmperpixel][i][1] == viewState.eS) {
                                    myImage.src = imageCache[newpcmperpixel][i][2];
                                    drawTimeLine();
                                    return;
                                }
                            }
                            killSpectroRenderingThread();
                            startSpectroRenderingThread(viewState, buffer);
                        } else {
                            killSpectroRenderingThread();
                            startSpectroRenderingThread(viewState, buffer);
                        }
                    } else { // image has to be rendered completely
                        killSpectroRenderingThread();
                        startSpectroRenderingThread(viewState, buffer);
                    }
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