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
                // FFT default vars
                var alpha = 0.16; // default alpha for Window Function
                var context = canvas.getContext("2d");
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
                
                
                scope.$watch('vs.curViewPort', function() {
                    if (!$.isEmptyObject(cache)) {
                        if(cache!=null) drawTimeLine(cache);
                    }
                }, true);                   
                
                scope.$watch('vs.spectroSettings', function() {
                    if (!$.isEmptyObject(scope.shs.currentBuffer)) {
                        clearImageCache();
                        drawOsci(scope.vs, scope.shs.currentBuffer);
                    }                
                }, true);                   
                                

                scope.$watch('vs.curViewPort', function() {
                    if (!$.isEmptyObject(scope.shs.currentBuffer)) {
                        redraw();
                    }
                }, true);  
                
                function redraw() {
                    ppp = Math.round((scope.vs.curViewPort.eS - scope.vs.curViewPort.sS) / canvas.width);
                    cache = cacheHit(scope.vs.curViewPort.sS,scope.vs.curViewPort.eS,ppp);
                    if(cache!=null) {
                        drawTimeLine(cache);
                    }
                    else {
                        drawOsci(scope.vs, scope.shs.currentBuffer);
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
					var posS = scope.vs.getPos(canvas.width, scope.vs.curViewPort.selectS);
					var posE = scope.vs.getPos(canvas.width, scope.vs.curViewPort.selectE);
					var sDist = scope.vs.getSampleDist(canvas.width);
					var xOffset;        
					if (scope.vs.curViewPort.selectS == scope.vs.curViewPort.selectE) {
						// calc. offset dependant on type of tier of mousemove  -> default is sample exact
						if (scope.vs.curMouseMoveTierType == "seg") {
							xOffset = 0;
						} else {
							xOffset = (sDist / 2);
						}
						context.fillStyle = scope.config.vals.colors.selectedBorderColor;
						context.fillRect(posS + xOffset, 0, 1, canvas.height);
						context.fillStyle = scope.config.vals.colors.labelColor;
						context.fillText(scope.vs.round(scope.vs.curViewPort.selectS / 44100 + (1 / 44100) / 2, 6), posS + xOffset + 5, scope.config.vals.colors.fontPxSize);
						context.fillText(scope.vs.curViewPort.selectS, posS + xOffset + 5, scope.config.vals.colors.fontPxSize * 2);
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
						var tW = context.measureText(scope.vs.curViewPort.selectS).width;
						context.fillText(scope.vs.curViewPort.selectS, posS - tW - 4, scope.config.vals.colors.fontPxSize);
						tW = context.measureText(scope.vs.round(scope.vs.curViewPort.selectS / 44100, 6)).width;
						context.fillText(scope.vs.round(scope.vs.curViewPort.selectS / 44100, 6), posS - tW - 4, scope.config.vals.colors.fontPxSize * 2);
						// end values
						context.fillText(scope.vs.curViewPort.selectE, posE + 5, scope.config.vals.colors.fontPxSize);
						context.fillText(scope.vs.round(scope.vs.curViewPort.selectE / 44100, 6), posE + 5, scope.config.vals.colors.fontPxSize * 2);
						// dur values
						// check if space
						if (posE - posS > context.measureText(scope.vs.round((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100, 6)).width) {
							tW = context.measureText(scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS).width;
							context.fillText(scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize);
							tW = context.measureText(scope.vs.round((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100, 6)).width;
							context.fillText(scope.vs.round(((scope.vs.curViewPort.selectE - scope.vs.curViewPort.selectS) / 44100), 6), posS + (posE - posS) / 2 - tW / 2, scope.config.vals.colors.fontPxSize * 2);
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
                    var myImage = new Image();
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
                
                function findEnum(myset, v) {
                    for(var k in myset) {
                       if(k==v) return k;
                    }
                    return -1;
                }                

                function startSpectroRenderingThread(viewState, buffer) {
                    pcmperpixel = Math.round((viewState.curViewPort.eS - viewState.curViewPort.sS) / canvas.width);
                    primeWorker = new Worker(URL.createObjectURL(blob));
                    var parseData = buffer.getChannelData(0).subarray(viewState.curViewPort.sS, viewState.curViewPort.eS + (2 * viewState.spectroSettings.windowLength));
                    
                    setupEvent();
                    console.log(viewState.spectroSettings);

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
                        'dynRangeInDB': viewState.spectroSettings.dynamicRange
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