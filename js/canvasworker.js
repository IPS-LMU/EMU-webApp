
    // other vars
    var offlineContext = new webkitOfflineAudioContext(channels,sampleRate,sampleRate);
    var offline = document.getElementById("spectrogram");
    var c_width = offline.width;
    var c_height = offline.height;   
    var context = offline.getContext("2d");
    var myImage = new Image();
    var primeWorker = new Worker('js/spectrogram.js');
    var isSourceBufferLoaded = false;




    primeWorker.addEventListener('message', function(event){
    	context.clearRect(0, 0, c_width, c_height);
		myImage.src = event.data;
		myImage.onload = function() {
        	context.drawImage(myImage, 0, 0);
		}
	});
    
    
    // load Sound decode and send buffer to renderLine(buffer)
    function loadSpectrogramSound(url) {
    	// Load asynchronously
		ocontext = new webkitAudioContext();
	    var request = new XMLHttpRequest();
	    request.open("GET", url, true);
	    request.responseType = "arraybuffer";
    	request.onload = function() { 
        	sourceBuffer = ocontext.createBuffer(request.response, true);
	        isSourceBufferLoaded = true;
    	    finishLoad();
	    }
    	request.send();
    } 
    

	function finishLoad() {
    	if (!isSourceBufferLoaded)
        	return; 
	    startOfflineProcessing();
	}
   
	function startOfflineProcessing() {
    	offlineContext = new webkitOfflineAudioContext(1, sourceBuffer.duration * sampleRate, sampleRate);
	    var source = offlineContext.createBufferSource();
    	source.buffer = sourceBuffer;    
	    primeWorker.postMessage({'cmd': 'config', 'N': N});
    	primeWorker.postMessage({'cmd': 'config', 'freq': freq});
	    primeWorker.postMessage({'cmd': 'config', 'start': start});
    	primeWorker.postMessage({'cmd': 'config', 'end': end});
	    primeWorker.postMessage({'cmd': 'config', 'window': windowFunction});
    	primeWorker.postMessage({'cmd': 'config', 'width': c_width});
	    primeWorker.postMessage({'cmd': 'config', 'height': c_height});    
    	offlineContext.startRendering();    
        offlineContext.oncomplete = function(event) {
	    	var data = JSON.stringify(sourceBuffer);
			primeWorker.postMessage({'cmd': 'pcm', 'config': data});		
			primeWorker.postMessage({'cmd': 'pcm', 'stream': sourceBuffer.getChannelData(0)});		
			primeWorker.postMessage({'cmd': 'render'});
		};    
	}
       
	/*
    function update() {		// function to set new values from html form an load sound again
    	var newfft = document.getElementById("myfft").value;
    	var newwindow = document.getElementById("mywindow").value;
    	var newstart = document.getElementById("start").value;
    	var newend = document.getElementById("end").value;
    	var newfreq = document.getElementById("myfreq").value;
    	N = parseInt(newfft,10);
    	var nstart = parseInt(newstart,10);
    	var nend = parseInt(newend,10);
    	freq = parseInt(newfreq,10);
    	switch(newwindow) {
    		case "BLACKMAN":
    			windowFunction = myWindow.BLACKMAN;
    			break;
    		case "BARTLETTHANN":
    			windowFunction = myWindow.BARTLETTHANN;
    			break;    
    		case "BARTLETT":
    			windowFunction = myWindow.BARTLETT;
    			break;    
    		case "COSINE":
    			windowFunction = myWindow.COSINE;
    			break;
    		case "RECTANGULAR":
    			windowFunction = myWindow.RECTANGULAR;
    			break;
    		case "LANCZOS":
    			windowFunction = myWindow.LANCZOS;
    			break;  
    		case "GAUSS":
    			windowFunction = myWindow.GAUSS;
    			break;  
    		case "HANN":
    			windowFunction = myWindow.HANN;
    			break;      
    		case "HAMMING":
    			windowFunction = myWindow.HAMMING;
    			break;  
    		default:
    			windowFunction = myWindow.HAMMING;
    			break;      			    			    			  			    			        			    						
    	}

    		start = nstart;
    		end = nend;
	    	finishLoad();

    }*/