'use strict';

WaveSurfer.Drawer = {
    defaultParams: {
        waveColor: '#333',
        progressColor: '#777',
        cursorWidth: 1,
        loadingColor: '#333',
        loadingBars: 20,
        barHeight: 1,
        barMargin: 10
    },

    init: function (params) {
        var my = this;
        this.params = Object.create(params);
        Object.keys(this.defaultParams).forEach(function (key) {
            if (!(key in params)) { params[key] = my.defaultParams[key]; }
        });

        this.canvas = params.canvas;
        this.specCanvas = params.specCanvas;
        this.scrollCanvas = params.scrollCanvas;


        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.start = 0;
        this.end = this.width;

        this.specWidth = this.specCanvas.clientWidth;
        this.specHeight = this.specCanvas.clientHeight;

        this.scrollWidth = this.scrollCanvas.clientWidth;
        this.scrollHeight = this.scrollCanvas.clientHeight;


        this.cc = this.canvas.getContext('2d');
        this.scc = this.specCanvas.getContext('2d');
        this.scrollcc =  this.scrollCanvas.getContext('2d')

        this.toRetinaRatio(this.cc);
        this.toRetinaRatio(this.scc);
        this.toRetinaRatio(this.scrollcc);

        if (params.image) {
            this.loadImage(params.image, this.drawImage.bind(this));
        }

        if (!this.width || !this.height) {
            console.error('Canvas size is zero.');
        }
    },

    getPeaks: function (buffer, vP) {
        //console.log(vP);
        // PCM Samples per new pixel
        //var k = buffer.getChannelData(0).length / this.width;
        //console.log(buffer.getChannelData(0).length);

        var k = (vP.eS-vP.sS)/ this.width;
        
        if(k<=1){
            console.log("should start drawing lines!!!");
        }

        this.peaks = [];
        this.maxPeak = -Infinity;

        var chan = buffer.getChannelData(c);
        var relData = chan.subarray(vP.sS, vP.eS);

        for (var i = 0; i < this.width; i++) {
            var sum = 0;
            for (var c = 0; c < buffer.numberOfChannels; c++) {

                var vals = relData.subarray(i * k, (i + 1) * k);
                var peak = -Infinity;

                var av = 0;
                for (var p = 0, l = vals.length; p < l; p++){
                    //console.log(p);
                    if (vals[p] > peak){
                        peak = vals[p];
                    }
                    av += vals[p];
                    
                }
                //sum += peak;
                sum += av/vals.length;
            }

            this.peaks[i] = sum;
            if (sum > this.maxPeak) {
                this.maxPeak = sum;
            }
        }
    },

    progress: function (percents, vP, bufferLength) {

        //map percents to viewPort
        var sInB = percents*bufferLength;
        this.cursorPos = ~~(this.width*(sInB-vP.sS)/(vP.eS-vP.sS)); 

        this.redraw();
        this.drawTimeLine(vP);
    },

    drawSpec: function(fftData){
        //console.log(percents);
        
        this.scc.fillStyle = this.params.progressColor;
        this.scc.clearRect(0, 0, this.specWidth, this.specHeight);

        var max = Math.max.apply(Math, fftData);
        var curVal;
        for (var i = 0; i < this.specHeight; i++) {
            //curVal = this.specHeight-fftData[i]/max*this.specHeight;
            curVal = Math.floor(255*fftData[i]/max);
            this.scc.fillStyle = 'rgb(' + curVal + ',' + curVal +',' + curVal + ')';
            
            this.scc.fillRect(this.cursorPos, i, 10, 1);

        };
    
    },
    
    drawBuffer: function (buffer, vP) {
        this.getPeaks(buffer, vP);
        this.progress(0, vP, buffer.length);
        this.drawTimeLine(vP);
    },

    drawTimeLine: function (vP){
        //console.log(vP);
        this.cc.strokeStyle = this.params.waveColor;

        //this.cc.fillRect(x, y, w, h);
        this.cc.beginPath();
        this.cc.moveTo(0,0);
        this.cc.lineTo(5,5);
        this.cc.moveTo(this.width, 0);
        this.cc.lineTo(this.width-5, 5);
        this.cc.moveTo(0, this.height/2);
        this.cc.lineTo(this.width, this.height/2);
        
        this.cc.closePath();
        this.cc.stroke();

        if(vP){
            this.cc.font="8px Arial";
            var metrics = this.cc.measureText(vP.eS);
            this.cc.strokeText(vP.sS, 5, 5+8);
            this.cc.strokeText(vP.eS, this.width-metrics.width-5, 5+8);
        }
    },

    /**
     * Redraws the entire canvas on each audio frame.
     */
    redraw: function () {
        var my = this;
        this.clear();

        // Draw WebAudio buffer peaks.
        if (this.peaks) {
            this.peaks.forEach(function (peak, index) {
                if (index!=0){
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index-1]);
                }
            });
        // Or draw an image.
        } else if (this.image) {
            this.drawImage();
        }

        this.drawCursor();
    },

    clear: function () {
        this.cc.clearRect(0, 0, this.width, this.height);
    },

    drawFrame: function (index, value, max, prevPeak) {
        //cur
        var w = 1;        
        var h = Math.round(value * (this.height / max)); //rel to max

        var x = index * w;
        var y = Math.round((this.height - h)/2);

        //prev
        var prevW = 1;
        var prevH = Math.round(prevPeak * (this.height / max));
        var prevX = (index-1) * w;
        var prevY =  Math.round((this.height - prevH) / 2);


        if (this.cursorPos >= x) {
            this.cc.fillStyle = this.params.progressColor;
            this.cc.strokeStyle = this.params.progressColor;
        } else {
            this.cc.fillStyle = this.params.waveColor;
            this.cc.strokeStyle = this.params.waveColor;
        }

        //this.cc.fillRect(x, y, w, h);
        //this.cc.fillRect(x, y, 1, 1);
        //this.cc.fillRect(x, y+h, 1, 1);
        
        this.cc.beginPath();
        this.cc.moveTo(prevX,prevY);
        this.cc.lineTo(x,y);
        this.cc.closePath();
        this.cc.stroke();


    },

    drawCursor: function () {
        var w = this.params.cursorWidth;
        var h = this.height;

        var x = Math.min(this.cursorPos, this.width - w);
        var y = 0;

        this.cc.fillStyle = this.params.cursorColor;
        this.cc.fillRect(x, y, w, h);
    },

    /**
     * Loads and caches an image.
     */
    loadImage: function (url, callback) {
        var my = this;
        var img = document.createElement('img');
        var onLoad = function () {
            img.removeEventListener('load', onLoad);
            my.image = img;
            callback(img);
        };
        img.addEventListener('load', onLoad, false);
        img.src = url;
    },

    /**
     * Draws a pre-drawn waveform image.
     */
    drawImage: function () {
        var cc = this.cc;
        cc.drawImage(this.image, 0, 0, this.width, this.height);
        cc.save();
        cc.globalCompositeOperation = 'source-atop';
        cc.fillStyle = this.params.progressColor;
        cc.fillRect(0, 0, this.cursorPos, this.height);
        cc.restore();
    },

    drawLoading: function (progress) {
        var color = this.params.loadingColor;
        var bars = this.params.loadingBars;
        var barHeight = this.params.barHeight;
        var margin = this.params.barMargin;
        var barWidth = ~~(this.width / bars) - margin;
        var progressBars = ~~(bars * progress);
        var y = ~~(this.height - barHeight) / 2;

        this.cc.fillStyle = color;
        for (var i = 0; i < progressBars; i += 1) {
            var x = i * barWidth + i * margin;
            this.cc.fillRect(x, y, barWidth, barHeight);
        }
    },

    drawScroll: function (relX, vP, bufferLength) {
        
        console.log(relX);

        this.scrollcc.clearRect(0, 0, this.scrollWidth, this.scrollHeight);

        var curCenter = relX * this.scrollWidth;

        var circCtl = 5;
        var curDiam = (((vP.eS-vP.sS)/bufferLength) * this.scrollWidth)/2 + 2*circCtl;
        

        this.scrollcc.beginPath();
        this.scrollcc.moveTo(curCenter-curDiam, 1);
        this.scrollcc.lineTo(curCenter+curDiam, 1);
        this.scrollcc.quadraticCurveTo(curCenter+curDiam+circCtl, 1,  
                    curCenter+curDiam+circCtl, this.scrollHeight/2);

        this.scrollcc.quadraticCurveTo(curCenter+curDiam+circCtl, this.scrollHeight-1,
            curCenter+curDiam, this.scrollHeight-1);

        this.scrollcc.lineTo(curCenter-curDiam, this.scrollHeight-1);

        this.scrollcc.quadraticCurveTo(curCenter-curDiam-circCtl, this.scrollHeight-1, 
            curCenter-curDiam-circCtl, this.scrollHeight/2);

        this.scrollcc.quadraticCurveTo(curCenter-curDiam-circCtl, 1, 
             curCenter-curDiam, 1);

        this.scrollcc.fillStyle = this.params.waveColor;
        this.scrollcc.fill();

        this.scrollcc.strokeStyle = this.params.progressColor;
        this.scrollcc.stroke();

    },

    toRetinaRatio: function (canvas) {
                var backingStoreRatio, ratio;
        devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = this.cc.webkitBackingStorePixelRatio || this.cc.mozBackingStorePixelRatio || this.cc.msBackingStorePixelRatio || this.cc.oBackingStorePixelRatio || this.cc.backingStorePixelRatio || 1, ratio = devicePixelRatio / backingStoreRatio;

        if (devicePixelRatio !== backingStoreRatio) {

            //waveCanvas
            var oldWidth = this.width;
            var oldHeight = this.height;

            this.canvas.width = oldWidth * ratio;
            this.canvas.height = oldHeight * ratio;

            this.canvas.style.width = oldWidth + 'px';
            this.canvas.style.height = oldHeight + 'px';

            // now scale the context to counter
            // the fact that we've manually scaled
            // our canvas element
            this.cc.scale(ratio, ratio);
        
        }
    }

};
