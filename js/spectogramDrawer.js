var spectogramDrawer = {

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
        my.freq = 8000;                                   // default upper Frequency
		my.sampleRate = 44100;                            // default sample Rate
        my.pixel_height = 1;                             // default pixel height per value
        my.renderingCanvas = false;
        my.primeWorkerFile = 'js/spectrogram.js';
        my.primeWorker = new Worker(my.primeWorkerFile);
        my.offline = params.specCanvas;
        my.context = my.offline.getContext("2d");          
        },
        
        killSpectroRenderingThread: function () {
            var my = this;
            my.context.fillStyle = "rgb(255,255,255)";
        	my.context.fillRect(0,0,my.offline.width,my.offline.height);        
            my.primeWorker.terminate();
        	my.primeWorker = null;
		},
        
        
        startSpectroRenderingThread: function (current_buffer,pcm_start,pcm_end) {
            var my = this;
            my.primeWorker = new Worker(my.primeWorkerFile);
            my.myImage = new Image();
            my.primeWorker.addEventListener('message', function(event){
                my.myImage.src = event.data;
                my.myImage.onload = function() {
    	    	my.context.drawImage(my.myImage, 0, 0);
			}
		});
		
		var data_conf = JSON.stringify(current_buffer);
    	my.sStart = Math.round(pcm_start);		
    	my.sEnd = Math.round(pcm_end);		

		if(my.sStart != undefined && my.sEnd != undefined ) {
		
    		my.primeWorker.postMessage({'cmd': 'config', 'N': my.N});
	    	my.primeWorker.postMessage({'cmd': 'config', 'alpha': my.alpha});
    		my.primeWorker.postMessage({'cmd': 'config', 'freq': my.freq});
	    	my.primeWorker.postMessage({'cmd': 'config', 'start': my.sStart});
	    	my.primeWorker.postMessage({'cmd': 'config', 'end': my.sEnd});
		    my.primeWorker.postMessage({'cmd': 'config', 'window': my.windowFunction});
    		my.primeWorker.postMessage({'cmd': 'config', 'width': my.offline.width});
		    my.primeWorker.postMessage({'cmd': 'config', 'height': my.offline.height});     
		    my.primeWorker.postMessage({'cmd': 'config', 'dynRangeInDB': my.dynRangeInDB});     
	    	my.primeWorker.postMessage({'cmd': 'pcm', 'config': data_conf});		
			my.primeWorker.postMessage({'cmd': 'pcm', 'stream': current_buffer.getChannelData(0)});		
			my.primeWorker.postMessage({'cmd': 'render'});

		
		}
	}        
   
       
};


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
                    if(isNaN(nN)) {
                        alert("Please enter numbers");
    	        	    //$("#windowLength").val() = "";
                    }
                    else N = nN;
    		  	emulabeller.startSpectroRendering();
    		  	$(this).dialog('close');
    		  	isOpen = false;
    		},
    		Abbrechen: function() {
    			$(this).dialog('close');
    			isOpen = false;
    		}
    	}
    });
    $('#specSettings').click(function() {
    	isOpen = $('#specDialog').dialog('isOpen');
    	if(!isOpen) {
    		$('#specDialog').dialog('open');
    		$("#specDialog").dialog('moveToTop'); 
    		isOpen = true;
    	}
    	else {
    		$('#specDialog').dialog('close');
    		isOpen = false;
    	}
    }); 