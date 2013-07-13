EmuLabeller.Drawer.SpectogramDrawer = {

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
        my.canvas = params.specCanvas;
        my.context = params.specCanvas.getContext("2d");    
        my.pcmperpixel = 0; 
        my.myImage = new Image();
        my.font = params.font;
        my.params = params.defaultParams;
        window.URL = window.URL || window.webkitURL;
        my.devicePixelRatio = window.devicePixelRatio || 1;
        my.response = spectroworker.textContent;
        my.blob;
        try { my.blob = new Blob([my.response], { "type" : "text\/javascript" }); }
        catch (e) { // Backwards-compatibility
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                my.blob.append(my.response);
                my.blob = my.blob.getBlob();
        }
        my.primeWorker = new Worker(URL.createObjectURL(my.blob));
		my.setupEvent();
		my.clearImageCache();
		
		$("#specDialog").dialog({
         bgiframe: true,
         autoOpen: false,
         width: 500,
         closeOnEscape: true,
         show: 'fade',
         hide: 'fade',
         position: 'center',
         stack: false,
         buttons: {
            OK: function() {
                var nN = $("#windowLength").val();
                var nvrf = $("#viewrange_from").val();
                var nvrt = $("#viewrange_to").val();
                var ndr = $("#dynamicRange").val();
                var nwf = $("#windowFunction").val();
                if (isNaN(nN) || isNaN(nvrf) || isNaN(nvrt) || isNaN(ndr)) {
                    alert("Please enter valid numbers !");
                } else {
                    my.N = parseInt(nN, 10);
                    my.freq = parseInt(nvrt, 10);
                    my.freq_lower = parseInt(nvrf, 10);
                    my.dynRangeInDB = parseInt(ndr, 10);
                    my.windowFunction = parseInt(nwf, 10);
                    my.clearImageCache();
                    my.killSpectroRenderingThread();
                    my.uiDraw();
                    my.drawTimeLine();
                    $(this).dialog('close');
                }
            },
            Cancel: function() {
                $(this).dialog('close');
            }
         }
        });		
		
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
                    if(my.worker_cache_side==0)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.canvas.width, my.canvas.height, 0, 0, my.canvas.width, my.canvas.height);
    	    	    if(my.worker_cache_side==1)
    	    	        my.context.drawImage(my.myImage, 0, 0, my.render_width, my.canvas.height, 0, 0, my.render_width, my.canvas.height);
    	    	    if(my.worker_cache_side==2)
    	    	        my.context.drawImage(my.myImage, my.worker_cache_width, 0, my.render_width, my.canvas.height, my.worker_cache_width, 0, my.render_width, my.canvas.height);
    	    	        
    	    	    my.buildImageCache(my.worker_start,my.worker_end,my.canvas.toDataURL("image/png"));
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
        
        drawTimeLineContext: function () {
            var my = this;
            var sInB = emulabeller.viewPort.percent*emulabeller.backend.currentBuffer.length;
            var all = emulabeller.viewPort.eS-emulabeller.viewPort.sS;
            var fracS = emulabeller.viewPort.selectS-emulabeller.viewPort.sS;
            var procS = fracS/all;
            var posS = my.canvas.width*procS;
            var fracE = emulabeller.viewPort.selectE-emulabeller.viewPort.sS;
            var procE = fracE/all;
            var posE = my.canvas.width*procE;
            my.cursorPos = ~~(my.canvas.width*(sInB-emulabeller.viewPort.sS)/(emulabeller.viewPort.eS-emulabeller.viewPort.sS));
            if(my.cursorPos!=0) {
                my.context.fillStyle = my.params.progressColor;
                my.context.fillRect(my.cursorPos, 0, 1, my.canvas.height);
            }            
            if (emulabeller.viewPort.selectS != 0 && emulabeller.viewPort.selectE != 0){
                my.context.fillStyle = my.params.selectedArea;
                my.context.fillRect(posS, 0, posE-posS, my.canvas.height);
                my.context.strokeStyle = my.params.selectedBorder;
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
            my.context.fillStyle = my.params.loadingBackground;
        	my.context.fillRect(0,0,my.canvas.width,my.canvas.height);    
        	my.context.font = my.font;
        	my.context.fillStyle = my.params.loadingColor;
        	my.context.fillText(my.params.loadingText, 10, 25);   
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
        
        uiDraw: function() {
            var my = this;
            my.newpcmperpixel = Math.round((emulabeller.viewPort.eS-emulabeller.viewPort.sS)/my.canvas.width);
            if(my.imageCache!=null) {
                if(my.imageCache[my.newpcmperpixel]!=null) {
					//my.found_parts = false;
					//my.pixel_covering = 0;
					//my.pixel_cache_selected = 0;
					
                    for (var i = 0; i < my.imageCache[my.newpcmperpixel].length; ++i) {
                        // check for complete image
                    	if(my.imageCache[my.newpcmperpixel][i][0]==emulabeller.viewPort.sS &&
                    	   my.imageCache[my.newpcmperpixel][i][1]==emulabeller.viewPort.eS) {
    	    	            my.myImage.src = my.imageCache[my.newpcmperpixel][i][2];
    	    	            my.drawTimeLine();
    	    	            return;
                    	}
                    }
            	    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread();                    
                }
                else {
            	    my.killSpectroRenderingThread();
                    my.startSpectroRenderingThread();				
                }
            } 
                    	/* check for cache on left side
                        if(my.imageCache[my.newpcmperpixel][i][0] > emulabeller.viewPort.sS && 
                    	    my.imageCache[my.newpcmperpixel][i][0] < emulabeller.viewPort.eS) {
                    	    my.pixel_cover = Math.floor((my.myend-my.imageCache[my.newpcmperpixel][i][0])/my.newpcmperpixel);
                    	    if(my.pixel_cover > my.pixel_covering ) {
                			    my.pixel_covering = my.pixel_cover;
                		        my.pixel_cache_selected = i;
                		        my.pixel_side = 1;
                    		    my.found_parts = true;	
                    		}
                    	}
                    	
                    	// check for image on right side
                        if(my.imageCache[my.newpcmperpixel][i][1] > emulabeller.viewPort.sS && 
                	        my.imageCache[my.newpcmperpixel][i][1] < emulabeller.viewPort.eS) {
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
                    my.startSpectroRenderingThread();				
                }
        },    
        
        

        
        startSpectroRenderingThread: function () {
            var my = this;

            my.pcmperpixel = Math.round((emulabeller.viewPort.eS-emulabeller.viewPort.sS)/my.canvas.width);
            my.primeWorker = new Worker(URL.createObjectURL(my.blob));
            my.setupEvent();
                        
            my.primeWorker.postMessage({'cmd': 'config', 'N': my.N});
            my.primeWorker.postMessage({'cmd': 'config', 'alpha': my.alpha});
            my.primeWorker.postMessage({'cmd': 'config', 'freq': my.freq});
            my.primeWorker.postMessage({'cmd': 'config', 'freq_low': my.freq_lower});
            my.primeWorker.postMessage({'cmd': 'config', 'start': Math.round(emulabeller.viewPort.sS)});
            my.primeWorker.postMessage({'cmd': 'config', 'end': Math.round(emulabeller.viewPort.eS)});
            my.primeWorker.postMessage({'cmd': 'config', 'myStep': my.pcmperpixel});
            my.primeWorker.postMessage({'cmd': 'config', 'window': my.windowFunction});
            my.primeWorker.postMessage({'cmd': 'config', 'cacheSide': 0});
            my.primeWorker.postMessage({'cmd': 'config', 'width': my.canvas.width});
            my.primeWorker.postMessage({'cmd': 'config', 'height': my.canvas.height});
            my.primeWorker.postMessage({'cmd': 'config', 'cacheWidth': 0});    
            my.primeWorker.postMessage({'cmd': 'config', 'dynRangeInDB': my.dynRangeInDB}); 
            my.primeWorker.postMessage({'cmd': 'config', 'pixelRatio': my.devicePixelRatio}); 
            my.primeWorker.postMessage({'cmd': 'pcm', 'config': JSON.stringify(emulabeller.backend.currentBuffer)});		
            my.primeWorker.postMessage({'cmd': 'pcm', 'stream': emulabeller.backend.currentBuffer.getChannelData(0).subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS+(2*my.N))});		
            my.primeWorker.postMessage({'cmd': 'render'});
        }    
};



