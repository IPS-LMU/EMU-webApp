EmuLabeller.Drawer.OsciDrawer = {

    init: function(params) {
        this.waveColor = 'black';
        this.progressColor = 'grey';
        this.scrollSegMarkerColor = "rgba(0, 0, 0, 0.3)";

        this.selMarkerColor = "rgba(22, 22, 22, 0.2)";
        this.selBoundColor = "black";

        this.cursorColor = 'red';
        this.cursorWidth = 1;


        // calculated positions of samples in view
        this.peaks = [];
        this.maxPeak = -Infinity;
        this.minPeak = Infinity;
        this.osciCanvas = params.osciCanvas;
        this.scrollCanvas = params.scrollCanvas;

        this.forTesting = 1;

        this.sR = 44100; // SIC not good hardcoded

    },

    getPeaks: function() {

        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS) / this.osciCanvas.width; // PCM Samples per new pixel

        this.peaks = [];
        this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = emulabeller.backend.currentBuffer.getChannelData(c);
        // console.log(chan);
        var relData = chan.subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS);

        if (k <= 1) {
            console.log("over sample exact!!!");
            relData = chan.subarray(emulabeller.viewPort.sS - 1, emulabeller.viewPort.eS + 2); // +2 to compensate for length
            this.minPeak = Math.min.apply(Math, relData);
            this.maxPeak = Math.max.apply(Math, relData);
            this.peaks = Array.prototype.slice.call(relData);
            // console.log(this.peaks)
        } else {


            for (var i = 0; i < this.osciCanvas.width; i++) {
                var sum = 0;
                for (var c = 0; c < emulabeller.backend.currentBuffer.numberOfChannels; c++) {

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

    drawOsciOnCanvas: function() {
        //this.resizeCanvases();
        var my = this;
        var cc = this.osciCanvas.getContext("2d");
        cc.strokeStyle = "black";
        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS + 1) / this.osciCanvas.width; // PCM Samples per new pixel
        console.log(this.peaks.length)
        // Draw WebAudio emulabeller.backend.currentBuffer peaks using draw frame
        if (this.peaks && k >= 1) {
            this.peaks.forEach(function(peak, index) {
                if (index !== 0) {
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index - 1], my.osciCanvas, emulabeller.backend.currentBuffer);
                }
            });
        } else if (k < 1) {
            var hDbS = (1 / k) / 2; // half distance between samples
            var sNr = emulabeller.viewPort.sS;
            // over sample exact
            cc.strokeStyle = this.waveColor;
            cc.beginPath();
            cc.moveTo(-hDbS, (this.peaks[0] - my.minPeak) / (my.maxPeak - my.minPeak) * my.osciCanvas.height);
            for (var i = 1; i < this.peaks.length; i++) {
                cc.lineTo(i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * my.osciCanvas.height);
            }
            cc.lineTo(this.osciWidth, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * my.osciCanvas.height); // SIC SIC SIC tail
            cc.stroke();
            // draw sample dots
            for (var i = 1; i < this.peaks.length; i++) {
                cc.beginPath();
                cc.arc(i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * my.osciCanvas.height, 4, 0, 2 * Math.PI, false);
                cc.stroke();
                cc.fill();
                cc.strokeText(sNr, i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * my.osciCanvas.height - 10);
                sNr = sNr+1;
            }
        }

    },

    drawFrame: function(index, value, max, prevPeak, canvas) {
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

    /**
     * draws markup of osci according to
     * the information that is specified in
     * the viewport
     */
    drawVpOsciMarkup: function() {
        var my = this;
        var cc = this.osciCanvas.getContext("2d");
        var yOffsetTime = 13;
        var yOffsetSample = 25;

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
            sTime = emulabeller.viewPort.round(emulabeller.viewPort.sS / this.sR, 6);
            eTime = emulabeller.viewPort.round(emulabeller.viewPort.eS / this.sR, 6);
            var metrics = cc.measureText(sTime);
            cc.strokeText(sTime, 5, yOffsetTime);
            cc.strokeText(eTime, this.osciCanvas.width - metrics.width - 5, yOffsetTime);
            cc.strokeText(emulabeller.viewPort.sS, 5, yOffsetSample);
            cc.strokeText(emulabeller.viewPort.eS, this.osciCanvas.width - cc.measureText(emulabeller.viewPort.eS).width - 5, yOffsetSample);

        }


        //draw emulabeller.viewPortselected
        if (emulabeller.viewPort.selectS !== 0 && emulabeller.viewPort.selectE !== 0) {
            var posS = emulabeller.viewPort.getPos(this.osciCanvas.width, emulabeller.viewPort.selectS);
            var posE = emulabeller.viewPort.getPos(this.osciCanvas.width, emulabeller.viewPort.selectE);

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
                cc.strokeText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR, 6), posS + 5, yOffsetTime);
                cc.strokeText(emulabeller.viewPort.eS, posS + 5, yOffsetSample);
            } else {
                var tW = cc.measureText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR, 6)).width;
                cc.strokeText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR, 6), posS - tW - 4, yOffsetTime);
                cc.strokeText(emulabeller.viewPort.round(emulabeller.viewPort.selectE / this.sR, 6), posE + 5, yOffsetTime);

                cc.strokeText(emulabeller.viewPort.selectS, posS - tW - 4, yOffsetSample);
                cc.strokeText(emulabeller.viewPort.selectE, posE + 5, yOffsetSample);

                tW = cc.measureText(emulabeller.viewPort.round((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR, 6)).width;
                cc.strokeText(emulabeller.viewPort.round(((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR), 6), posS + (posE - posS) / 2 - tW / 2, yOffsetTime);

                tW = cc.measureText(emulabeller.viewPort.round((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR, 6)).width;
                cc.strokeText(emulabeller.viewPort.selectE - emulabeller.viewPort.selectS, posS + (posE - posS) / 2 - tW / 2, yOffsetSample);


            }
        }
        // cursor
        if (emulabeller.viewPort.curCursorPosInPercent > 0) {
            //calc cursor pos
            var all2 = emulabeller.viewPort.eS - emulabeller.viewPort.sS;
            var fracC = emulabeller.viewPort.curCursorPosInPercent * emulabeller.backend.currentBufferLength - emulabeller.viewPort.sS;
            var procC = fracC / all2;
            var posC = this.osciCanvas.width * procC;

            //draw cursor
            cc.fillStyle = this.cursorColor;
            cc.fillRect(posC, 0, this.cursorWidth, this.osciCanvas.height);
            // console.log(all)

        }
    },


    /**
     * redraws emulabeller.backend.currentBuffer onto canvas given emulabeller.viewPort. It recalculates
     * the peaks that are to be displayed to get the maximum
     * dynamic range visualization
     *
     * @params emulabeller.backend.currentBuffer
     * @params canvas to draw on
     * @params emulabeller.backend.currentBufferLength current view port
     */
    redrawOsciOnCanvas: function(inMemoryCanvas) {
        var sH = this.osciCanvas.height;
        var sW = this.osciCanvas.width;
        var tH = inMemoryCanvas.height;
        var tW = inMemoryCanvas.width;

        canvascc = inMemoryCanvas.getContext('2d');
        canvascc.clearRect(0, 0, tW, tH);
        canvascc.drawImage(this.osciCanvas, 0, 0, sW, sH, 0, 0, tW, tH);
    },

    /**
     * draws the current osci defined by the peaks array
     * to the canvas given. It should be used when no
     * recalculation of the view port is needed
     * (e.g. progress update or mouse event updates)
     *
     * @params emulabeller.backend.currentBuffer
     * @params canvas to draw on
     * @params emulabeller.backend.currentBufferLength current view port
     */
    drawCurOsciOnCanvas: function() {
        var cH = this.osciCanvas.height;
        var cW = this.osciCanvas.width;

        canvascc = this.osciCanvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        osciWidth = this.osciCanvas.width;
        osciHeight = this.osciCanvas.height;

        this.getPeaks();

        // this.getPeaks(emulabeller.backend.currentBuffer, emulabeller.viewPort, canvas);
        // console.log(this.peaks);
        this.drawOsciOnCanvas();
    },


    /**
     * draws scroll markup (selected view part + scroll bar)
     * according to current view port
     * on the canvas given
     * @params emulabeller.viewPort current view port
     * @params canvas canvas to draw markup on
     * @params emulabeller.backend.currentBufferLength length of emulabeller.backend.currentBuffer in canvas
     */
    drawScrollMarkup: function(inMemoryCanvas) {

        var cH = this.scrollCanvas.height;
        var cW = this.scrollCanvas.width;
        canvascc = this.scrollCanvas.getContext('2d');
        canvascc.globalCompositeOperation = "lighter";
        canvascc.clearRect(0, 0, cW, cH);

        var circCtl = 3;
        var curDiam = (((emulabeller.viewPort.eS - emulabeller.viewPort.sS) / emulabeller.viewPort.bufferLength) * cW) / 2 + 2 * circCtl;
        var curCenter = (emulabeller.viewPort.sS / emulabeller.viewPort.bufferLength * cW) + curDiam;

        canvascc.globalAlpha = 0.7;
        canvascc.drawImage(inMemoryCanvas, 0, 0, cW, cH);

        canvascc.globalAlpha = 1;
        canvascc.fillStyle = this.scrollSegMarkerColor;
        canvascc.fillRect(curCenter - curDiam, 0, 2 * curDiam, cH);
        // draw scroll bar itself
        canvascc.fillRect(curCenter - curDiam, cH / 8 * 7, 2 * curDiam, cH / 8);
        canvascc.beginPath();
        canvascc.arc(curCenter + curDiam, cH / 8 * 7 + (cH / 8) / 2, (cH / 8) / 2, 1.5 * Math.PI, 2.5 * Math.PI, false);
        canvascc.closePath();
        canvascc.fill();
        canvascc.fill(); // fill twice for color correction

        canvascc.beginPath();
        canvascc.arc(curCenter - curDiam, cH / 8 * 7 + (cH / 8) / 2, (cH / 8) / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);
        canvascc.closePath();
        canvascc.fill();
        canvascc.fill(); // fill twice for color correction
    }
};