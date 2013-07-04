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
        window.URL = window.URL || window.webkitURL;
        my.devicePixelRatio = window.devicePixelRatio || 1;
        my.response = document.querySelector('#spectroworker').textContent;
        my.blob;
        try {
                my.blob = new Blob([my.response], { "type" : "text\/javascript" });
        } 
        catch (e) { // Backwards-compatibility
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                my.blob.append(my.response);
                my.blob = my.blob.getBlob();
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
        my.primeWorker = new Worker(URL.createObjectURL(my.blob));
		my.setupEvent();
		my.clearImageCache();
        my.canvas = params.specCanvas;
        my.context = params.specCanvas.getContext("2d");    
        my.drawer = params.drawer; 
        my.pcmperpixel = 0; 
        my.myImage = new Image();
        my.font = "10px Helvetica";
        my.fontColor = "#000";
        my.loadingText = "calculating ...";
        my.vP = null;
        my.tempData = "";
        my.percent = 0;
        my.bufferLength = 0;
        my.optimizeHeight = false;
        },
        
        setupEvent: function () {
            var my = this;
            my.primeWorker.addEventListener('message', function(event){
            
            	my.worker_img = event.data.img;
            	my.worker_start = event.data.start;
            	my.worker_end = event.data.end;
            	my.worker_cache_width = event.data.cacheWidth;
            	my.worker_cache_side = event.data.cacheSide;
                my.render_width = my.canvas.width - my.worker_cache_width;
                my.myImage.onload = function() {
                    // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
                    if(my.worker_cache_side==0)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.canvas.width, my.canvas.height, 0, 0, my.canvas.width, my.canvas.height);
    	    	    if(my.worker_cache_side==1)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.render_width, my.canvas.height, 0, 0, my.render_width, my.canvas.height);
    	    	    if(my.worker_cache_side==2)
    	    	        my.context.drawImage(my.myImage, my.worker_cache_width, 0, my.render_width, my.canvas.height, my.worker_cache_width, 0, my.render_width, my.canvas.height);
    	    	        
    	    	    //my.toRetinaRatio(my.canvas,my.context); 	
    	    	    my.tempData =  my.canvas.toDataURL("image/png");
    	    	    my.buildImageCache(my.worker_start,my.worker_end,my.tempData);
    	    	    my.drawTimeLineContext();
                }
                my.myImage.src = my.worker_img;
                
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
        
        progress: function (percents, vP, bufferLength, ssffInfos) {
            var my = this;
            my.vP = vP;
            my.percent = percents;
            my.bufferLength = bufferLength;
            my.drawTimeLine();
        /*if(ssffInfos){
            if(ssffInfos.data.length > 0){
                this.drawSSFF(ssffInfos, vP);
            }
        }*/
        },    

        drawTimeLineContext: function () {
            var my = this;
            var sInB = my.percent*my.bufferLength;
            var all = my.vP.eS-my.vP.sS;
            var fracS = my.vP.selectS-my.vP.sS;
            var procS = fracS/all;
            var posS = my.canvas.width*procS;
            var fracE = my.vP.selectE-my.vP.sS;
            var procE = fracE/all;
            var posE = my.canvas.width*procE;
            my.cursorPos = ~~(my.canvas.width*(sInB-my.vP.sS)/(my.vP.eS-my.vP.sS));
            if(my.cursorPos!=0) {
                my.context.fillStyle ="#FF0000";
                my.context.fillRect(my.cursorPos, 0, 1, my.canvas.height);
            }            
            if (my.vP.selectS != 0 && my.vP.selectE != 0){
                my.context.fillStyle = "rgba(0, 0, 255, 0.2)";
                my.context.fillRect(posS, 0, posE-posS, my.canvas.height);
                my.context.strokeStyle = "rgba(0, 255, 0, 0.5)";
                my.context.beginPath();
                my.context.moveTo(posS,0);
                my.context.lineTo(posS,my.canvas.height);
                my.context.moveTo(posE,0);
                my.context.lineTo(posE,my.canvas.height);
                my.context.closePath();
                my.context.stroke();   
            }     
        },
           
        
        drawTimeLine: function (){ 
            var my = this;
            var image = new Image();
            image.onload = function() {
                my.context.drawImage(image, 0, 0);
                my.drawTimeLineContext();           
            };
            image.src = this.myImage.src;
        },
        
        
        killSpectroRenderingThread: function () {
            var my = this;
            my.context.fillStyle = "rgb(255,255,255)";
        	my.context.fillRect(0,0,my.canvas.width,my.canvas.height);    
        	my.context.fillStyle = my.fontColor;
        	my.context.font = my.font;
        	my.context.fillText(my.loadingText, 2, 10); 
        	//my.toRetinaRatio(my.canvas,my.context);   
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
        
        drawImage: function(mybuf,vP) {
            var my = this;
            my.vP = vP;   
            my.newpcmperpixel = Math.round((my.vP.eS-my.vP.sS)/my.canvas.width);
            if(my.imageCache!=null) {
                if(my.imageCache[my.newpcmperpixel]!=null) {
					//my.found_parts = false;
					//my.pixel_covering = 0;
					//my.pixel_cache_selected = 0;
					
                    for (var i = 0; i < my.imageCache[my.newpcmperpixel].length; ++i) {
                        // check for complete image
                    	if(my.imageCache[my.newpcmperpixel][i][0]==my.vP.sS &&
                    	   my.imageCache[my.newpcmperpixel][i][1]==my.vP.eS) {
    	    	            my.myImage.src = my.imageCache[my.newpcmperpixel][i][2];
    	    	            
    	    	            my.drawTimeLine();
    	    	            return;
                    	}
                    }
            	    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread(mybuf,my.vP.sS,my.vP.eS,my.canvas.width,my.canvas.height,0,0);                    
                }
                else {
            	    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread(mybuf,my.vP.sS,my.vP.eS,my.canvas.width,my.canvas.height,0,0);				
                }
            } 
                    	/* check for cache on left side
                        if(my.imageCache[my.newpcmperpixel][i][0] > my.vP.sS && 
                    	    my.imageCache[my.newpcmperpixel][i][0] < my.vP.eS) {
                    	    my.pixel_cover = Math.floor((my.myend-my.imageCache[my.newpcmperpixel][i][0])/my.newpcmperpixel);
                    	    if(my.pixel_cover > my.pixel_covering ) {
                			    my.pixel_covering = my.pixel_cover;
                		        my.pixel_cache_selected = i;
                		        my.pixel_side = 1;
                    		    my.found_parts = true;	
                    		}
                    	}
                    	
                    	// check for image on right side
                        if(my.imageCache[my.newpcmperpixel][i][1] > my.vP.sS && 
                	        my.imageCache[my.newpcmperpixel][i][1] < my.vP.eS) {
                		    my.pixel_cover = Math.floor((my.imageCache[my.newpcmperpixel][i][1]-my.mystart)/my.newpcmperpixel);
                		    if(my.pixel_cover > my.pixel_covering ) {
                			    my.pixel_covering = my.pixel_cover;
                		        my.pixel_cache_selected = i;
                    		    my.pixel_side = 2;
                    		    my.found_parts = true;
                    	    }
                        }
                    }
                   f(my.found_parts && my.pixel_covering > 0) {
                    	my.killSpectroRenderingThread();
                	    my.tempImage = new Image(my.pixel_covering,my.canvas.height);
                	    

                        if(my.pixel_side==1) {
                            my.tempImage.onload = function() {
    	    	                my.context.drawImage(my.tempImage,                         // image
    	    	                                     0, 0,                                     // sx,sy
    	    	                                     my.canvas.width,my.canvas.height,       // swidth, sheight
    	    	                                     (my.canvas.width-my.pixel_covering),0,    // x,y
    	    	                                     my.canvas.width,my.canvas.height);      // width, height
                            }
                            my.startSpectroRenderingThread(mybuf,
                                                           my.mystart,my.myend,
                                                           my.canvas.width,my.canvas.height,
                                                           my.pixel_covering,1);
                                                                                       
                    	}
                        
                        if(my.pixel_side==2) {
                            my.tempImage.onload = function() {
    	    	                my.context.drawImage(my.tempImage,                          // image
    	    	                                     (my.canvas.width-my.pixel_covering), 0,    // sx,sy
    	    	                                     my.pixel_covering,my.canvas.height,        // swidth, sheight
    	    	                                     0,0,                                       // x,y
    	    	                                     my.pixel_covering,my.canvas.height);       // width, height
                            }
                            my.startSpectroRenderingThread(mybuf,
                                                           my.mystart,my.myend,
                                                           my.canvas.width,my.canvas.height,
                                                           my.pixel_covering,2);
                    	}
                    	my.tempImage.src = my.imageCache[my.newpcmperpixel][my.pixel_cache_selected][2];
                             
                    }
                    
                    else {    // image has to be rendered completely
                    //}
                }*/
                else {    // image has to be rendered completely
                    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread(mybuf,my.vP.sS,my.vP.eS,my.canvas.width,my.canvas.height,0,0);				
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
            my.primeWorker = new Worker(URL.createObjectURL(my.blob));
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
            my.primeWorker.postMessage({'cmd': 'config', 'pixelRatio': my.devicePixelRatio}); 
            my.primeWorker.postMessage({'cmd': 'pcm', 'config': data_conf});		
            my.primeWorker.postMessage({'cmd': 'pcm', 'stream': newFloat32Array});		
            my.primeWorker.postMessage({'cmd': 'render'});
        }    
};



