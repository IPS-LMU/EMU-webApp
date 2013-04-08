'use strict';

EmuLabeller.Drawer = {
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

        this.osciCanvas = params.canvas;
        this.specCanvas = params.specCanvas;
        this.scrollCanvas = params.scrollCanvas;


        this.osciWidth = this.osciCanvas.clientWidth;
        this.osciHeight = this.osciCanvas.clientHeight;
        this.start = 0;
        this.end = this.osciWidth;

        this.specWidth = this.specCanvas.clientWidth;
        this.specHeight = this.specCanvas.clientHeight;

        this.scrollWidth = this.scrollCanvas.clientWidth;
        this.scrollHeight = this.scrollCanvas.clientHeight;


        this.cc = this.osciCanvas.getContext('2d');
        this.scc = this.specCanvas.getContext('2d');
        this.scrollcc =  this.scrollCanvas.getContext('2d');

        this.tierInfos= params.tierInfos;

        this.tierInfos.contexts = [];

        for (var i =0; i<=this.tierInfos.canvases.length - 1 ; i++) {
            this.tierInfos.contexts.push(this.tierInfos.canvases[i].getContext('2d'));
            this.toRetinaRatio(this.tierInfos.canvases[i], this.tierInfos.contexts[i]);
        }

        //console.log(this.tierInfos);

        this.toRetinaRatio(this.osciCanvas, this.cc);
        this.toRetinaRatio(this.specCanvas, this.scc);
        this.toRetinaRatio(this.scrollCanvas, this.scrollcc);

        if (params.image) {
            this.loadImage(params.image, this.drawImage.bind(this));
        }

        if (!this.osciWidth || !this.osciHeight) {
            console.error('Canvas size is zero.');
        }
    },

    getPeaks: function (buffer, vP) {
        //console.log(vP);

        //var k = buffer.getChannelData(0).length / this.osciWidth;
        //console.log(buffer.getChannelData(0).length);

        var k = (vP.eS-vP.sS)/ this.osciWidth; // PCM Samples per new pixel

        this.peaks = [];
        this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = buffer.getChannelData(c);
        var relData = chan.subarray(vP.sS, vP.eS);

        if(k<=1){
            console.log("over sample exact!!!");

            this.minPeak = Math.min.apply(Math, relData);
            this.maxPeak = Math.max.apply(Math, relData);
            this.peaks = Array.prototype.slice.call(relData);
        }else{


        for (var i = 0; i < this.osciWidth; i++) {
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
    }//else
    },

    progress: function (percents, vP, bufferLength) {

        //map percents to viewPort
        var sInB = percents*bufferLength;
        this.cursorPos = ~~(this.osciWidth*(sInB-vP.sS)/(vP.eS-vP.sS));

        this.redraw(vP);
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
        }
    },

    drawBuffer: function (buffer, vP) {
        // if(vP.eS-vP.sS > buffer.length){
        //     console.log("weeeeeeeeasdf");

        // }

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
        this.cc.moveTo(this.osciWidth, 0);
        this.cc.lineTo(this.osciWidth-5, 5);
        this.cc.moveTo(0, this.osciHeight/2);
        this.cc.lineTo(this.osciWidth, this.osciHeight/2);
        
        this.cc.closePath();
        this.cc.stroke();

        if(vP){
            this.cc.font="8px Arial";
            var metrics = this.cc.measureText(vP.eS);
            this.cc.strokeText(vP.sS, 5, 5+8);
            this.cc.strokeText(vP.eS, this.osciWidth-metrics.width-5, 5+8);
        }
        //draw vPselected
        if (vP.selectS != 0 && vP.selectE != 0){
            var all = vP.eS-vP.sS;
            var fracS = vP.selectS-vP.sS;
            var procS = fracS/all;
            var posS = this.osciWidth*procS;

            var fracE = vP.selectE-vP.sS;
            var procE = fracE/all;
            var posE = this.osciWidth*procE;

            this.cc.fillStyle = "rgba(0, 0, 255, 0.2)";
            this.cc.fillRect(posS, 0, posE-posS, this.osciHeight);

            this.cc.strokeStyle = "rgba(0, 255, 0, 0.5)";
            this.cc.beginPath();
            this.cc.moveTo(posS,0);
            this.cc.lineTo(posS,this.osciHeight);
            this.cc.moveTo(posE,0);
            this.cc.lineTo(posE,this.osciHeight);
            this.cc.closePath();
            this.cc.stroke();
        }
        //
        this.drawTiers(vP);
    },

    /**
     * Redraws the entire canvas on each audio frame.
     */
    redraw: function (vP) {
        //this.resizeCanvases();
        var my = this;
        this.clear();

        var k = (vP.eS-vP.sS)/ this.osciWidth; // PCM Samples per new pixel
        // Draw WebAudio buffer peaks using draw frame
        if (this.peaks && k >= 1) {
            this.peaks.forEach(function (peak, index) {
                if (index!==0){
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index-1]);
                }
            });
        // Or draw an image.
        } else if (k < 1) {
            this.cc.strokeStyle = this.params.waveColor;
            this.cc.beginPath();
            this.cc.moveTo(0,(this.peaks[0]-my.minPeak)/(my.maxPeak-my.minPeak)*this.osciHeight);
            for (var i = 1; i < this.peaks.length; i++) {
                this.cc.lineTo(i/k,(this.peaks[i]-my.minPeak)/(my.maxPeak-my.minPeak)*this.osciHeight);
            }
            this.cc.lineTo(this.osciWidth,(this.peaks[i]-my.minPeak)/(my.maxPeak-my.minPeak)*this.osciHeight);// SIC SIC SIC tail
            this.cc.stroke();
        }

        this.drawCursor();
    },

    clear: function () {
        this.cc.clearRect(0, 0, this.osciWidth, this.osciHeight);
    },

    drawFrame: function (index, value, max, prevPeak) {
        //cur
        var w = 1;
        var h = Math.round(value * (this.osciHeight / max)); //rel to max
        var x = index * w;
        var y = Math.round((this.osciHeight - h)/2);

        //prev
        var prevW = 1;
        var prevH = Math.round(prevPeak * (this.osciHeight / max));
        var prevX = (index-1) * w;
        var prevY =  Math.round((this.osciHeight - prevH) / 2);


        if (this.cursorPos >= x) {
            this.cc.fillStyle = this.params.progressColor;
            this.cc.strokeStyle = this.params.progressColor;
        } else {
            this.cc.fillStyle = this.params.waveColor;
            this.cc.strokeStyle = this.params.waveColor;
        }

        this.cc.beginPath();
        this.cc.moveTo(prevX,prevY);
        this.cc.lineTo(x,y);
        //this.cc.closePath();
        this.cc.stroke();


    },

    drawCursor: function () {
        var w = this.params.cursorWidth;
        var h = this.osciHeight;

        var x = Math.min(this.cursorPos, this.osciWidth - w);
        var y = 0;

        this.cc.fillStyle = this.params.cursorColor;
        this.cc.fillRect(x, y, w, h);
    },


    /**
     * Draws a pre-drawn waveform image.
     *
    drawImage: function () {
        var cc = this.cc;
        cc.drawImage(this.image, 0, 0, this.osciWidth, this.osciHeight);
        cc.save();
        cc.globalCompositeOperation = 'source-atop';
        cc.fillStyle = this.params.progressColor;
        cc.fillRect(0, 0, this.cursorPos, this.osciHeight);
        cc.restore();
    },*/


    drawScroll: function (relX, vP, bufferLength) {
        //console.log(relX);

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

    drawTiers: function(vP) {
        //console.log(this.tierInfos.contexts.length);

        //console.log(vP);
        var curcc;
        var curCanv;
        for (var i =0; i<=this.tierInfos.contexts.length - 1 ; i++) {
            //console.log("here");
            curCanv = this.tierInfos.canvases[i];
            curcc = this.tierInfos.contexts[i];

            var curCanHeight = curCanv.clientHeight;
            var curCanWidth = curCanv.clientWidth;


            var all = vP.eS-vP.sS;
            var fracS = vP.selectS-vP.sS;
            var procS = fracS/all;
            var posS = this.osciWidth*procS;

            var fracE = vP.selectE-vP.sS;
            var procE = fracE/all;
            var posE = this.osciWidth*procE;

            curcc.clearRect(0, 0, curCanWidth, curCanHeight);
            curcc.strokeStyle = "rgba(0, 255, 0, 0.5)";
            curcc.beginPath();
            curcc.moveTo(posS,0);
            curcc.lineTo(posS,curCanHeight);
            curcc.moveTo(posE,0);
            curcc.lineTo(posE,curCanHeight);
            curcc.stroke();

            if(vP.selectS == vP.selectE){
                curcc.beginPath();
                curcc.arc(posS, 5, 5, 0, 2 * Math.PI, false);
                curcc.stroke();
            }

            // draw name
            curcc.strokeStyle = this.params.waveColor;
            curcc.font="8px Arial";
            curcc.strokeText(this.tierInfos.tiersDetails[i].TierName, 5, 5+8);

            var cI = this.tierInfos.tiersDetails[i];

            var ev, perc, tW;
            if (cI.type == "seg"){
                //draw seg
                for (ev = 0; ev < cI.events.length; ev++) {
                    if(cI.events[ev].time > vP.sS && cI.events[ev].time < vP.eS){
                        perc = (cI.events[ev].time-vP.sS)/(vP.eS-vP.sS);
                        curcc.fillRect(curCanWidth*perc, 0, 1, curCanHeight);

                        if(cI.events[ev].label != 'H#'){
                            tW = curcc.measureText(cI.events[ev].label).width;
                            curcc.strokeText(cI.events[ev].label, curCanWidth*perc-10, curCanHeight/2);
                        }
                    }
                    if(cI.events[ev].end > vP.sS && cI.events[ev].end < vP.eS){
                        perc = (cI.events[ev].end-vP.sS)/(vP.eS-vP.sS);
                        curcc.fillRect(curCanWidth*perc, 0, 1, curCanHeight);
                    }
                }

            }else if(cI.type =="point"){
                for (ev = 0; ev < cI.events.length; ev++) {
                    if(cI.events[ev].time > vP.sS && cI.events[ev].time < vP.eS){

                        perc = (cI.events[ev].time-vP.sS)/(vP.eS-vP.sS);
                        curcc.fillRect(curCanWidth*perc, 0, 1, curCanHeight/2-curCanHeight/10);

                        tW = curcc.measureText(cI.events[ev].label).width;
                        curcc.strokeText(cI.events[ev].label, curCanWidth*perc-tW/2+1, curCanHeight/2);

                        curcc.fillRect(curCanWidth*perc, curCanHeight/2+curCanHeight/10, 1, curCanHeight/2-curCanHeight/10);
                    }
                }
            }

        }
    }


};
