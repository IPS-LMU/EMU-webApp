EmuLabeller.spectogramDrawer = {

    init: function (params) {
        var my = this;
        my.myWindow = {
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
        my.PI = 3.141592653589793;                        // value : Math.PI
        my.TWO_PI = 6.283185307179586;                    // value : 2 * Math.PI
        my.OCTAVE_FACTOR=3.321928094887363;               // value : 1.0/log10(2)	
        my.emphasisPerOctave=3.9810717055349722;          // value : toLinearLevel(6);		
        my.dynamicRange=5000;                             // value : toLinearLevel(50);
        my.dynRangeInDB=50;                               // value : toLevelInDB(dynamicRange);    

        // FFT default vars
        my.N = 512;                                       // default FFT Window Size
        my.alpha = 0.16;                                  // default alpha for Window Function
        my.windowFunction = my.myWindow.BARTLETTHANN;     // default Window Function
        my.sampleRate = 44100;                            // default sample rate
        my.channels = 1;                                  // default number of channels
        my.freq_lower = 0;                                // default upper Frequency
        my.freq = 8000;                                   // default upper Frequency
		my.sampleRate = 44100;                            // default sample Rate
        my.pixel_height = 1;                             // default pixel height per value
        my.renderingCanvas = false;
        // plain old version load from script file
        //my.primeWorkerFile = 'js/spectrogram.js';
        //my.primeWorker = new Worker(my.primeWorkerFile);
        my.primeWorker= new Worker(URL.createObjectURL(blob));
		my.setupEvent();
		my.clearImageCache();
        my.canvas = params.specCanvas;
        my.context = params.specCanvas.getContext("2d");     
        my.pcmperpixel = 0; 
        my.myImage = new Image();
        my.font = "10px Helvetica";
        my.fontColor = "#000";
        my.loadingText = "calculating ...";
        },
        
        setupEvent: function () {
            var my = this;
            my.primeWorker.addEventListener('message', function(event){
            
            	my.worker_img = event.data.img;
            	my.worker_start = event.data.start;
            	my.worker_end = event.data.end;
            	my.worker_cache_width = event.data.cacheWidth;
            	my.worker_cache_side = event.data.cacheSide;
                my.myImage.src = my.worker_img;
                
                my.render_width = my.canvas.width - my.worker_cache_width;
                
                my.myImage.onload = function() {
                    // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
                    if(my.worker_cache_side==0)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.canvas.width, my.canvas.height, 0, 0, my.canvas.width, my.canvas.height);
    	    	    if(my.worker_cache_side==1)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.render_width, my.canvas.height, 0, 0, my.render_width, my.canvas.height);
    	    	    if(my.worker_cache_side==2)
    	    	        my.context.drawImage(my.myImage, my.worker_cache_width, 0, my.render_width, my.canvas.height, my.worker_cache_width, 0, my.render_width, my.canvas.height);
    	    	        
    	    	    my.toRetinaRatio(my.canvas,my.context);
    	    	    
    	    	    my.tempImage = my.canvas.toDataURL("image/png");
    	    	    my.buildImageCache(my.worker_start,my.worker_end,my.tempImage);
    	    	    
    	    	    
                }
            });        
        },
        
        buildImageCache: function (cstart,cend,imgData) {
            var my = this;
    	    if(my.imageCache[my.pcmperpixel]==null) 
    	    	my.imageCache[my.pcmperpixel] = new Array();
    	    	        
    	    if(my.imageCacheCounter[my.pcmperpixel]==null)
    	        my.imageCacheCounter[my.pcmperpixel] = 0;
    	            
    	    if(my.imageCache[my.pcmperpixel][my.imageCacheCounter[my.pcmperpixel]]==null) { 
    	    	my.imageCache[my.pcmperpixel][my.imageCacheCounter[my.pcmperpixel]] = new Array();
    	    	my.imageCache[my.pcmperpixel][my.imageCacheCounter[my.pcmperpixel]][0] = cstart;
    	    	my.imageCache[my.pcmperpixel][my.imageCacheCounter[my.pcmperpixel]][1] = cend;
    	    	my.imageCache[my.pcmperpixel][my.imageCacheCounter[my.pcmperpixel]][2] = imgData;
    	    	++my.imageCacheCounter[my.pcmperpixel];
    	    }
        },
        
        
        killSpectroRenderingThread: function () {
            var my = this;
            my.context.fillStyle = "rgb(255,255,255)";
        	my.context.fillRect(0,0,my.canvas.width,my.canvas.height);    
        	my.context.fillStyle = my.fontColor;
        	my.context.font = my.font;
        	my.context.fillText(my.loadingText, 2, 10); 
        	my.toRetinaRatio(my.canvas,my.context);   
            if(my.primeWorker!=null) {
            	my.primeWorker.terminate();
        		my.primeWorker = null;
        	}
        },
        
        clearImageCache: function () {
            var my = this;
            my.imageCache = null;
            my.imageCacheCounter = null;
            my.imageCache = new Array();            
            my.imageCacheCounter = new Array();            
        },        
        
        toRetinaRatio: function (canvas, context) {
            var backingStoreRatio, ratio;
            var devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1, ratio = devicePixelRatio / backingStoreRatio;

            if (devicePixelRatio !== backingStoreRatio) {
                //waveCanvas
                var oldWidth = canvas.clientWidth;
                var oldHeight = canvas.clientHeight;
                canvas.width = oldWidth * ratio;
                canvas.height = oldHeight * ratio;
                canvas.style.width = oldWidth + 'px';
                canvas.style.height = oldHeight + 'px';

                // now scale the context to counter
                // the fact that we've manually scaled
                // our canvas element
                context.scale(ratio, ratio);
            }
        }, 
        
        drawImage: function(mybuf,mystart,myend) {
            var my = this;
            my.newpcmperpixel = Math.round((myend-mystart)/my.canvas.width);
            if(my.imageCache!=null) {
                if(my.imageCache[my.newpcmperpixel]!=null) {
					my.found_parts = false;
					my.pixel_covering = 0;
					my.pixel_cache_selected = 0;
					
                    for (var i = 0; i < my.imageCache[my.newpcmperpixel].length; ++i) {
                        // check for complete image
                    	if(my.imageCache[my.newpcmperpixel][i][0]==mystart &&
                    	   my.imageCache[my.newpcmperpixel][i][1]==myend) {
                            my.killSpectroRenderingThread();
                            my.myImage.src = my.imageCache[my.newpcmperpixel][i][2];
                            my.myImage.onload = function() {
    	    	                my.context.drawImage(my.myImage, 0, 0);
    	    	                my.toRetinaRatio(my.canvas,my.context);
    	    	            };
    	    	            break;
                    	}
                    	// check for cache on left side
                        if(my.imageCache[my.newpcmperpixel][i][0] > mystart && 
                    	    my.imageCache[my.newpcmperpixel][i][0] < myend) {
                    	    my.pixel_cover = Math.floor((myend-my.imageCache[my.newpcmperpixel][i][0])/my.newpcmperpixel);
                    	    if(my.pixel_cover > my.pixel_covering ) {
                			    my.pixel_covering = my.pixel_cover;
                		        my.pixel_cache_selected = i;
                		        my.pixel_side = 1;
                    		    my.found_parts = true;	
                    		}
                    	}
                    	
                    	// check for image on right side
                        if(my.imageCache[my.newpcmperpixel][i][1] > mystart && 
                	        my.imageCache[my.newpcmperpixel][i][1] < myend) {
                		    my.pixel_cover = Math.floor((my.imageCache[my.newpcmperpixel][i][1]-mystart)/my.newpcmperpixel);
                		    if(my.pixel_cover > my.pixel_covering ) {
                			    my.pixel_covering = my.pixel_cover;
                		        my.pixel_cache_selected = i;
                    		    my.pixel_side = 2;
                    		    my.found_parts = true;
                    	    }
                        }
                    }
                    if(my.found_parts && my.pixel_covering > 0) {
                    	my.killSpectroRenderingThread();
                	    my.tempImage = new Image(my.pixel_covering,my.canvas.height);
                	    my.tempImage.src = my.imageCache[my.newpcmperpixel][my.pixel_cache_selected][2];

                        if(my.pixel_side==1) {
                            console.log("left");
                            my.tempImage.onload = function() {
    	    	                my.context.drawImage(my.tempImage,                         // image
    	    	                                     0, 0,                                     // sx,sy
    	    	                                     my.canvas.width,my.canvas.height,       // swidth, sheight
    	    	                                     (my.canvas.width-my.pixel_covering),0,    // x,y
    	    	                                     my.canvas.width,my.canvas.height);      // width, height
                            }
                            my.startSpectroRenderingThread(mybuf,
                                                           mystart,myend,
                                                           my.canvas.width,my.canvas.height,
                                                           my.pixel_covering,1);
                    	}
                        
                        if(my.pixel_side==2) {
                            console.log("right");
                            my.tempImage.onload = function() {
    	    	                my.context.drawImage(my.tempImage,                          // image
    	    	                                     (my.canvas.width-my.pixel_covering), 0,    // sx,sy
    	    	                                     my.canvas.width,my.canvas.height,        // swidth, sheight
    	    	                                     0,0,                                       // x,y
    	    	                                     my.canvas.width,my.canvas.height);       // width, height
                            }
                            my.startSpectroRenderingThread(mybuf,
                                                           mystart,myend,
                                                           my.canvas.width,my.canvas.height,
                                                           my.pixel_covering,2);
                    	}
                             
                    }
                    
                    else {    // image has to be rendered completely
            	        my.killSpectroRenderingThread();
                        my.startSpectroRenderingThread(mybuf,mystart,myend,my.canvas.width,my.canvas.height,0,0);				
                    }
                }
                else {    // image has to be rendered completely
                    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread(mybuf,mystart,myend,my.canvas.width,my.canvas.height,0,0);				
                }
            }	
        },    
        
        startSpectroRenderingThread: function (current_buffer,pcm_start,pcm_end,complete_width,complete_height,cache_width,cache_side) {
            var my = this;
            var newend = pcm_end+(2*my.N);
            var newFloat32Array = current_buffer.getChannelData(0).subarray(pcm_start, newend);			
            var data_conf = JSON.stringify(current_buffer);
            my.sStart = Math.round(pcm_start);		
            my.sEnd = Math.round(pcm_end);
            my.pcmperpixel = Math.round((pcm_end-pcm_start)/my.canvas.width);
            my.primeWorker = new Worker(URL.createObjectURL(blob));
            my.setupEvent();
                        
            my.primeWorker.postMessage({'cmd': 'config', 'N': my.N});
            my.primeWorker.postMessage({'cmd': 'config', 'alpha': my.alpha});
            my.primeWorker.postMessage({'cmd': 'config', 'freq': my.freq});
            my.primeWorker.postMessage({'cmd': 'config', 'freq_low': my.freq_lower});
            my.primeWorker.postMessage({'cmd': 'config', 'start': my.sStart});
            my.primeWorker.postMessage({'cmd': 'config', 'end': my.sEnd});
            my.primeWorker.postMessage({'cmd': 'config', 'myStep': my.pcmperpixel});
            my.primeWorker.postMessage({'cmd': 'config', 'window': my.windowFunction});
            my.primeWorker.postMessage({'cmd': 'config', 'cacheSide': cache_side});
            my.primeWorker.postMessage({'cmd': 'config', 'width': complete_width});
            my.primeWorker.postMessage({'cmd': 'config', 'height': complete_height});
            my.primeWorker.postMessage({'cmd': 'config', 'cacheWidth': cache_width});    
            my.primeWorker.postMessage({'cmd': 'config', 'dynRangeInDB': my.dynRangeInDB}); 
            my.primeWorker.postMessage({'cmd': 'pcm', 'config': data_conf});		
            my.primeWorker.postMessage({'cmd': 'pcm', 'stream': newFloat32Array});		
            my.primeWorker.postMessage({'cmd': 'render'});
        }    
};


// URL.createObjectURL
window.URL = window.URL || window.webkitURL;

// "Server response", used in all examples
var response = document.querySelector('#spectroworker').textContent;

var blob;
try {
    blob = new Blob([response], { "type" : "text\/javascript" });
} catch (e) { // Backwards-compatibility
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    blob = new BlobBuilder();
    blob.append(response);
    blob = blob.getBlob();
}

