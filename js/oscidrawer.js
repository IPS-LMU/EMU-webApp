EmuLabeller.Drawer.OsciDrawer = {

    init: function(params) {
        this.waveColor = 'black';
        this.progressColor = 'grey';
        this.scrollSegMarkerColor = "rgba(100, 100, 100, 0.6)";

        this.selMarkerColor = "rgba(0, 0, 255, 0.2)";
        this.selBoundColor = "black";

        this.cursorColor = 'red';
        this.cursorWidth = 1;


        // calculated positions of samples in view
        this.peaks = [];
        this.maxPeak = -Infinity;
        this.minPeak = Infinity;
        this.osciCanvas = params.osciCanvas;

        this.forTesting = 1;

        this.sR = 44100; // SIC not good hardcoded

    },

    getPeaks: function(buffer, canvas) {

        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS) / canvas.width; // PCM Samples per new pixel

        this.peaks = [];
        this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = buffer.getChannelData(c);
        // console.log(chan);
        var relData = chan.subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS);

        if (k <= 1) {
            console.log("over sample exact!!!");
            relData = chan.subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS + 1);
            this.minPeak = Math.min.apply(Math, relData);
            this.maxPeak = Math.max.apply(Math, relData);
            this.peaks = Array.prototype.slice.call(relData);
        } else {


            for (var i = 0; i < canvas.width; i++) {
                var sum = 0;
                for (var c = 0; c < buffer.numberOfChannels; c++) {

                    var vals = relData.subarray(i * k, (i + 1) * k);
                    var peak = -Infinity;

                    var av = 0;
                    for (var p = 0, l = vals.length; p < l; p++) {
                        //console.log(p);
                        if (vals[p] > peak) {
                            peak = vals[p];
                        }
                        av += vals[p];
                    }
                    //sum += peak;
                    sum += av / vals.length;
                }

                this.peaks[i] = sum;
                if (sum > this.maxPeak) {
                    this.maxPeak = sum;
                }
            }
        } //else
    },

    drawOsciOnCanvas: function(buffer) {
        //this.resizeCanvases();
        var my = this;
        var cc = this.osciCanvas.getContext("2d");
        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS) / this.osciCanvas.width; // PCM Samples per new pixel
        // Draw WebAudio buffer peaks using draw frame
        if (this.peaks && k >= 1) {
            this.peaks.forEach(function(peak, index) {
                if (index !== 0) {
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index - 1], my.osciCanvas, buffer);
                }
            });
            // over sample exact
        } else if (k < 1) {
            cc.strokeStyle = this.waveColor;
            cc.beginPath();
            cc.moveTo(0, (this.peaks[0] - my.minPeak) / (my.maxPeak - my.minPeak) * canvas.height);
            for (var i = 1; i < this.peaks.length; i++) {
                cc.lineTo(i / k, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * canvas.height);
            }
            cc.lineTo(this.osciWidth, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * canvas.height); // SIC SIC SIC tail
            cc.stroke();
        }

    },

    drawFrame: function(index, value, max, prevPeak, canvas, buffer) {
        var cc = canvas.getContext('2d');
        //calculate sample of cur cursor position

        //calc cursor pos
        var all = emulabeller.viewPort.eS - emulabeller.viewPort.sS;
        var fracC = emulabeller.viewPort.curCursorPosInPercent * emulabeller.viewPort.bufferLength - emulabeller.viewPort.sS;
        var procC = fracC / all;
        var posC = canvas.width * procC;

        //cur
        var w = 1;
        var h = Math.round(value * (canvas.height / max)); //rel to max
        var x = index * w;
        var y = Math.round((canvas.height - h) / 2);

        //prev
        var prevW = 1;
        var prevH = Math.round(prevPeak * (canvas.height / max));
        var prevX = (index - 1) * w;
        var prevY = Math.round((canvas.height - prevH) / 2);


        if (posC >= x) {
            cc.fillStyle = this.progressColor;
            cc.strokeStyle = this.progressColor;
        } else {
            cc.fillStyle = this.waveColor;
            cc.strokeStyle = this.waveColor;
        }

        cc.beginPath();
        cc.moveTo(prevX, prevY);
        cc.lineTo(x, y);
        //this.cc.closePath();
        cc.stroke();


    },

    drawVpOsciMarkup: function(buffer) {
        var my = this;
        var cc = this.osciCanvas.getContext("2d");
        //console.log(emulabeller.viewPort);
        cc.strokeStyle = this.waveColor;

        //this.cc.fillRect(x, y, w, h);
        cc.beginPath();
        cc.moveTo(0, 0);
        cc.lineTo(5, 5);
        cc.moveTo(this.osciCanvas.width, 0);
        cc.lineTo(this.osciCanvas.width - 5, 5);
        cc.moveTo(0, this.osciCanvas.height / 2);
        cc.lineTo(this.osciCanvas.width, this.osciCanvas.height / 2);

        cc.closePath();
        cc.stroke();
        var sTime;
        var eTime;
        if (emulabeller.viewPort) {
            cc.font = "12px Verdana";
            sTime = emulabeller.viewPort.round(emulabeller.viewPort.sS/this.sR, 6);
            eTime = emulabeller.viewPort.round(emulabeller.viewPort.eS/this.sR, 6);
            var metrics = cc.measureText(sTime);
            cc.strokeText(eTime, 5, 5 + 8);
            cc.strokeText(eTime, this.osciCanvas.width - metrics.width - 5, 5 + 8);
        }

        
        //draw emulabeller.viewPortselected
        if (emulabeller.viewPort.selectS !== 0 && emulabeller.viewPort.selectE !== 0) {
            var all = emulabeller.viewPort.eS - emulabeller.viewPort.sS;
            var fracS = emulabeller.viewPort.selectS - emulabeller.viewPort.sS;
            var procS = fracS / all;
            var posS = this.osciCanvas.width * procS;

            var fracE = emulabeller.viewPort.selectE - emulabeller.viewPort.sS;
            var procE = fracE / all;
            var posE = this.osciCanvas.width * procE;

            cc.fillStyle = this.selMarkerColor;
            cc.fillRect(posS, 0, posE - posS, this.osciCanvas.height);

            cc.strokeStyle = this.selBoundColor;
            cc.beginPath();
            cc.moveTo(posS, 0);
            cc.lineTo(posS, this.osciCanvas.height);
            cc.moveTo(posE, 0);
            cc.lineTo(posE, this.osciCanvas.height);
            cc.closePath();
            cc.stroke();

            cc.strokeStyle = this.waveColor;
            if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
                cc.strokeText(emulabeller.viewPort.selectS/this.sR, posS + 5, 13);
            } else {
                var tW = cc.measureText(emulabeller.viewPort.round(emulabeller.viewPort.selectS/this.sR, 6)).width;
                cc.strokeText(emulabeller.viewPort.round(emulabeller.viewPort.selectS/this.sR, 6), posS - tW - 4, 13);
                cc.strokeText(emulabeller.viewPort.round(emulabeller.viewPort.selectE/this.sR, 6), posE + 5, 13);

                tW = cc.measureText(emulabeller.viewPort.round((emulabeller.viewPort.selectE-emulabeller.viewPort.selectS)/this.sR,6)).width;
                cc.strokeText(emulabeller.viewPort.round(((emulabeller.viewPort.selectE-emulabeller.viewPort.selectS)/this.sR),6), posS+(posE-posS)/2 -tW/2, 13);

            }
        }
        // cursor
        if (emulabeller.viewPort.curCursorPosInPercent > 0) {
            //calc cursor pos
            var all2 = emulabeller.viewPort.eS - emulabeller.viewPort.sS;
            var fracC = emulabeller.viewPort.curCursorPosInPercent * emulabeller.viewPort.bufferLength - emulabeller.viewPort.sS;
            var procC = fracC / all2;
            var posC = canvas.width * procC;

            //draw cursor
            cc.fillStyle = this.cursorColor;
            cc.fillRect(posC, 0, this.cursorWidth, canvas.height);
            // console.log(all)

        }
    },


    /**
     * redraws buffer onto canvas given emulabeller.viewPort. It recalculates
     * the peaks that are to be displayed to get the maximum
     * dynamic range visualization
     *
     * @params buffer
     * @params canvas to draw on
     * @params bufferLength current view port
     */
    redrawOsciOnCanvas: function(buffer, canvas) {
        var cH = canvas.height;
        var cW = canvas.width;

        canvascc = canvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        osciWidth = canvas.width;
        osciHeight = canvas.height;

        this.getPeaks(buffer, canvas);
        this.drawOsciOnCanvas(buffer, canvas);
    },

    /**
     * draws the current osci defined by the peaks array
     * to the canvas given. It should be used when no
     * recalculation of the view port is needed
     * (e.g. progress update or mouse event updates)
     *
     * @params buffer
     * @params canvas to draw on
     * @params bufferLength current view port
     */
    drawCurOsciOnCanvas: function(buffer) {
        var cH = this.osciCanvas.height;
        var cW = this.osciCanvas.width;

        canvascc = this.osciCanvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        osciWidth = this.osciCanvas.width;
        osciHeight = this.osciCanvas.height;

        // this.getPeaks(buffer, emulabeller.viewPort, canvas);
        // console.log(this.peaks);
        this.drawOsciOnCanvas(buffer);
    },


    /**
     * draws scroll markup (selected view part + scroll bar)
     * according to current view port
     * on the canvas given
     * @params emulabeller.viewPort current view port
     * @params canvas canvas to draw markup on
     * @params bufferLength length of buffer in canvas
     */
    drawScrollMarkup: function(canvas, inMemoryCanvas, bufferLength) {

        var cH = canvas.height;
        var cW = canvas.width;
        canvascc = canvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        //draw osci minimap
        canvascc.drawImage(inMemoryCanvas, 0, 0, cW, cH);


        var circCtl = 3;
        var curDiam = (((emulabeller.viewPort.eS - emulabeller.viewPort.sS) / bufferLength) * cW) / 2 + 2 * circCtl;

        var curCenter = (emulabeller.viewPort.sS / bufferLength * cW) + curDiam;

        // SIC no more scroll bar
        // canvascc.beginPath();
        // canvascc.moveTo(curCenter-curDiam, cH-cW+1);
        // canvascc.lineTo(curCenter+curDiam, cH-cW+1);
        // canvascc.quadraticCurveTo(curCenter+curDiam+circCtl, cH-cW+1,
        //             curCenter+curDiam+circCtl, cH-cW/2);

        // canvascc.quadraticCurveTo(curCenter+curDiam+circCtl, cH-1,
        //     curCenter+curDiam, cH-1);

        // canvascc.lineTo(curCenter-curDiam, cH-1);

        // canvascc.quadraticCurveTo(curCenter-curDiam-circCtl, cH-1,
        //     curCenter-curDiam-circCtl, cH-cW/2);

        // canvascc.quadraticCurveTo(curCenter-curDiam-circCtl, cH-cW+1,
        //      curCenter-curDiam, cH-cW+1);


        canvascc.fillStyle = this.scrollSegMarkerColor;
        canvascc.fillRect(curCenter - curDiam, 0, 2 * curDiam, cH);

        // canvascc.fillStyle = "rgba(120, 120, 120, 0.5)";
        // canvascc.fill();

        // canvascc.strokeStyle = "rgba(120, 120, 120, 1)";
        // canvascc.stroke();
    }
};