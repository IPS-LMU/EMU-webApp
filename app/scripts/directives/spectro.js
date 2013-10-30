'use strict';


angular.module('emulvcApp')
    .directive('spectro', function() {
        return {
            templateUrl: 'views/spectro.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                // select the needed DOM elements from the template
                var canvas0 = element.find("canvas")[0];
                var canvas1 = element.find("canvas")[1];
                var canvas2 = element.find("canvas")[2];
                var myid = element[0].id;
                // FFT default vars
                var alpha = 0.16; // default alpha for Window Function
                var context = canvas0.getContext("2d");
                var contextssff = canvas1.getContext("2d");
                var contextmarkup = canvas2.getContext("2d");
                var pcmperpixel = 0;
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
                
                scope.$watch('vs.spectroSettings', function() {
                    if (!$.isEmptyObject(scope.shs.wavJSO.Data)) {
                        clearImageCache();
                        drawOsci(scope.vs, scope.shs.wavJSO.Data);
                    }                
                }, true);                   
                                

                scope.$watch('vs.curViewPort', function() {
                    if (!$.isEmptyObject(scope.shs.wavJSO.Data)) {
                        redraw();
                    }
                }, true);  
                
                scope.$watch('vs.scrollOpen', function() {
                    if (!$.isEmptyObject(scope.config.vals)) {
                        var per = scope.config.vals.main.osciSpectroZoomFactor * 10;
                        var perInvers = 100 - (scope.config.vals.main.osciSpectroZoomFactor * 10);
                        if(scope.vs.scrollOpen == 0) {
                            $('.OsciDiv').css({ height: '50%' });
                            $('.OsciDiv canvas').css({ height: '48%' });
                            $('.SpectroDiv').css({  height: '50%' });
                            $('.SpectroDiv canvas').css({ height: '48%' });
                        }
                        else if(scope.vs.scrollOpen == 1){
                            $('.OsciDiv').css({ height: per+'%' });
                            $('.OsciDiv canvas').css({ height: per+'%' });
                            $('.SpectroDiv').css({ height: perInvers+'%' });  
                            $('.SpectroDiv canvas').css({ height: perInvers+'%' });                      
                        }
                        else if(scope.vs.scrollOpen == 2){
                            $('.OsciDiv').css({ height: perInvers+'%' });
                            $('.OsciDiv canvas').css({ height: perInvers+'%' });
                            $('.SpectroDiv').css({ height: per+'%' });  
                            $('.SpectroDiv canvas').css({ height: per+'%' });                      
                        }                        
                    }
                }, true);                  
                
                function redraw() {
                    ppp = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
                    cache = cacheHit(scope.vs.curViewPort.sS,scope.vs.curViewPort.eS,ppp);
                    if(cache!=null) {
                        drawTimeLine(cache);
                        drawTimeLineContext();
                    }
                    else {
                        drawOsci(scope.vs, scope.shs.wavJSO.Data);
                    }
                }              

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
                    contextmarkup.clearRect(0, 0, canvas0.width, canvas0.height);
					var posS = scope.vs.getPos(canvas0.width, scope.vs.curViewPort.selectS);
					var posE = scope.vs.getPos(canvas0.width, scope.vs.curViewPort.selectE);
					var sDist = scope.vs.getSampleDist(canvas0.width);
					var xOffset;        
					if (scope.vs.curViewPort.selectS == scope.vs.curViewPort.selectE) {
						// calc. offset dependant on type of tier of mousemove  -> default is sample exact
						if (scope.vs.curMouseMoveTierType == "seg") {
							xOffset = 0;
						} else {
							xOffset = (sDist / 2);
						}
						contextmarkup.fillStyle = scope.config.vals.colors.selectedBorderColor;
						contextmarkup.fillRect(posS + xOffset, 0, 1, canvas0.height);
						contextmarkup.fillStyle = scope.config.vals.colors.labelColor;
						contextmarkup.fillText(scope.vs.round(scope.vs.curViewPort.selectS / 44100 + (1 / 44100) / 2, 6), posS + xOffset + 5, scope.config.vals.colors.fontPxSize);
						contextmarkup.fillText(scope.vs.curViewPort.selectS, posS + xOffset + 5, scope.config.vals.colors.fontPxSize * 2);
					} else {
						contextmarkup.fillStyle = scope.config.vals.colors.selectedAreaColor;
						contextmarkup.fillRect(posS, 0, posE - posS, canvas0.height);
						contextmarkup.strokeStyle = scope.config.vals.colors.selectedBoundaryColor;
						contextmarkup.beginPath();
						contextmarkup.moveTo(posS, 0);
						contextmarkup.lineTo(posS, canvas0.height);
						contextmarkup.moveTo(posE, 0);
						contextmarkup.lineTo(posE, canvas0.height);
						contextmarkup.closePath();
						contextmarkup.stroke();
						contextmarkup.fillStyle = canvas0.labelColor;
						// start values
						var tW = contextmarkup.measureText(scope.vs.curViewPort.selectS).width;
						contextmarkup.fillText(scope.vs.curViewPort.selectS, posS - tW - 4, scope.config.vals.colors.fontPxSize);
						tW = contextmarkup.measureText(scope.vs.round(scope.vs.curViewPort.selectS / 44100, 6)).width;
						contextmarkup.fillText(scope.vs.round(scope.vs.curViewPort.selectS / 44100, 6), posS - tW - 4, scope.config.vals.colors.fontPxSize * 2);
						// end values
						contextmarkup.fillText(scope.vs.curViewPort.selectE, posE + 5, scope.config.vals.colors.fontPxSize);
						contextmarkup.fillText(scope.vs.round(scope.vs.curViewPort.selectE / 44100, 6), posE + 5, scope.config.vals.colors.fontPxSize * 2);
						// dur values
						// check if space
						if (posE - posS > contextmarkup.measureText(scope.vs.round((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100, 6)).width) {
							tW = contextmarkup.measureText(scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS).width;
							contextmarkup.fillText(scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize);
							tW = contextmarkup.measureText(scope.vs.round((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100, 6)).width;
							contextmarkup.fillText(scope.vs.round(((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100), 6), posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize * 2);
						}
					}
                }



                function drawTimeLine(id) {
                    var image = new Image();
                    image.onload = function() {
                        context.drawImage(image, 0, 0);
                    };
                    image.src = imageCache[id][3];
                }


                function killSpectroRenderingThread() {
                    context.fillStyle = "#222";
                    context.fillRect(0, 0, canvas0.width, canvas0.height);
                    context.font = "10px Verdana";
                    context.fillStyle = "#333";
                    context.fillText("loading...", 10, 25);
                    if (primeWorker != null) {
                        primeWorker.terminate();
                        primeWorker = null;
                    }
                }

                function setupEvent() {
                    var myImage = new Image();
                    ppp = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas0.width);
                    primeWorker.addEventListener('message', function(event) {
                        var worker_img = event.data.img;
                        myImage.onload = function() {
                            context.drawImage(myImage, 0, 0, canvas0.width, canvas0.height, 0, 0, canvas0.width, canvas0.height);
                            buildImageCache(scope.vs.curViewPort.sS, scope.vs.curViewPort.eS, ppp,canvas0.toDataURL("image/png"));
                            drawTimeLineContext();                            
                        }
                        myImage.src = worker_img;
                    });
                    
                }

                function drawOsci(viewState, buffer) {
                    killSpectroRenderingThread();
                    startSpectroRenderingThread(viewState, buffer);
                }
                
                function findEnum(myset, v) {
                    for(var k in myset) {
                       if(k==v) return k;
                    }
                    return -1;
                }                

                function startSpectroRenderingThread(viewState, buffer) {
                    pcmperpixel = Math.round((viewState.curViewPort.eS - viewState.curViewPort.sS) / canvas0.width);
                    primeWorker = new Worker(URL.createObjectURL(blob));
                    var x = buffer.subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + (2 * viewState.spectroSettings.windowLength));
                    var parseData = new Float32Array(x);
                    console.log(scope.shs.wavJSO);
                    console.log(pcmperpixel);
                    setupEvent();

                    primeWorker.postMessage({
                        'cmd': 'config',
                        'N': viewState.spectroSettings.windowLength
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'alpha': alpha
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'freq': viewState.spectroSettings.rangeTo
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'freq_low': viewState.spectroSettings.rangeFrom
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'start': Math.round(viewState.curViewPort.sS)
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'end': Math.round(viewState.curViewPort.eS)
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'myStep': pcmperpixel
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'window': findEnum(myWindow, viewState.spectroSettings.window)
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'cacheSide': 0
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'width': canvas0.width
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'height': canvas0.height
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'cacheWidth': 0
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'dynRangeInDB': viewState.spectroSettings.dynamicRange
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'pixelRatio': devicePixelRatio
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'sampleRate': scope.shs.wavJSO.SampleRate
                    });
                    primeWorker.postMessage({
                        'cmd': 'config',
                        'streamChannels': scope.shs.wavJSO.NumChannels
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