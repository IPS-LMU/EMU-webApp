/**
 * Drawer to handle all different
 * types of osci drawing
 * also handles viewport markup drawing
 * of main osci + markup of minimap
 */
EmuLabeller.Drawer.OsciDrawer = {

    defaultParams: {}, // use if wish to overwrite drawer colors

    /**
     * init method
     * @param params
     */
    init: function(params) {
        var my = this;
        this.params = Object.create(params);
        Object.keys(this.defaultParams).forEach(function(key) {
            if (!(key in params)) {
                params[key] = my.defaultParams[key];
            }
        });

        // calculated positions of samples in view
        this.peaks = [];
        this.maxPeak = -Infinity;
        this.minPeak = Infinity;
        this.osciCanvas = params.osciCanvas;
        this.scrollCanvas = params.scrollCanvas;

        this.forTesting = 1;

        this.sR = 44100; // SIC not good hardcoded
        this.showSampleNrs = false; // probably only good for debugging / developing

    },

    /**
     * get current peaks to be drawn
     * if drawing over sample exact -> samples
     * if multiple samples per pixel -> calculate envelope points
     */
    getPeaks: function() {

        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS) / this.osciCanvas.width; // PCM Samples per new pixel

        this.peaks = [];
        this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = emulabeller.backend.currentBuffer.getChannelData(c);
        // console.log(chan);
        var relData;

        if (k <= 1) {
            // check if view at start            
            if (emulabeller.viewPort.sS === 0) {
                relData = chan.subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS + 2); // +2 to compensate for length
            } else {
                relData = chan.subarray(emulabeller.viewPort.sS - 1, emulabeller.viewPort.eS + 2); // +2 to compensate for length
            }
            this.minPeak = Math.min.apply(Math, relData);
            this.maxPeak = Math.max.apply(Math, relData);
            this.peaks = Array.prototype.slice.call(relData);
            // console.log(this.peaks)
        } else {
            relData = chan.subarray(emulabeller.viewPort.sS, emulabeller.viewPort.eS);

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

    /**
     * draws osci on canvas by drawing the this.peaks
     * values to canvas.
     * @param c
     */

    drawOsciOnCanvas: function(c) {
        //this.resizeCanvases();
        var my = this;
        var can;
        var cc;
        if (c != null) {
            cc = c.getContext("2d");
            can = c;
        } else {
            cc = this.osciCanvas.getContext("2d");
            can = my.osciCanvas;
        }
        var k = (emulabeller.viewPort.eS - emulabeller.viewPort.sS + 1) / can.width; // PCM Samples per new pixel
        // Draw WebAudio emulabeller.backend.currentBuffer peaks using draw frame
        if (this.peaks && k >= 1) {
            this.peaks.forEach(function(peak, index) {
                if (index !== 0) {
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index - 1], can, emulabeller.backend.currentBuffer);
                }
            });
        } else if (k < 1) {
            var hDbS = (1 / k) / 2; // half distance between samples
            var sNr = emulabeller.viewPort.sS;
            // over sample exact
            cc.strokeStyle = this.params.osciColor;
            cc.fillStyle = this.params.osciColor;
            cc.beginPath();
            var i;
            if (emulabeller.viewPort.sS === 0) {
                cc.moveTo(hDbS, (this.peaks[0] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height);
                for (i = 0; i < this.peaks.length; i++) {
                    cc.lineTo(i / k + hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height);
                }
                cc.stroke();
                // draw sample dots
                for (i = 0; i < this.peaks.length; i++) {
                    cc.beginPath();
                    cc.arc(i / k + hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height, 4, 0, 2 * Math.PI, false);
                    cc.stroke();
                    cc.fill();
                    if (this.showSampleNrs) {
                        cc.strokeText(sNr, i / k + hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height - 10);
                        sNr = sNr + 1;
                    }
                }
            } else {
                //draw lines
                cc.moveTo(-hDbS, (this.peaks[0] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height);
                for (i = 1; i < this.peaks.length; i++) {
                    cc.lineTo(i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height+3);
                }
                cc.stroke();
                // draw sample dots
                for (i = 1; i < this.peaks.length; i++) {
                    // if (this.peaks[i - 1] > 0 && this.peaks[i] < 0 || this.peaks[i - 1] < 0 && this.peaks[i] > 0) {
                    //     cc.fillRect(i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height, 50, 50);
                    // }
                    cc.beginPath();
                    cc.arc(i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height, 4, 0, 2 * Math.PI, false);
                    cc.stroke();
                    cc.fill();
                    if (this.showSampleNrs) {
                        cc.fillText(sNr, i / k - hDbS, (this.peaks[i] - my.minPeak) / (my.maxPeak - my.minPeak) * can.height - 10);
                        sNr = sNr + 1;
                    }
                }

            }


        }

    },

    /**
     * drawing method to draw single line between two
     * envelope points. Is used by drawOsciOnCanvas if
     * envelope drawing is done
     * @param index
     * @param value
     * @param max
     * @param prevPeak
     * @param canvas
     */
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
            cc.fillStyle = this.params.playProgressColor;
            cc.strokeStyle = this.params.playProgressColor;
        } else {
            cc.fillStyle = this.params.osciColor;
            cc.strokeStyle = this.params.osciColor;
        }

        cc.beginPath();
        cc.moveTo(prevX, prevY);
        cc.lineTo(x, y);
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
        // var yOffsetTime = 13;
        // var yOffsetSample = 25;

        cc.strokeStyle = this.params.labelColor;
        cc.fillStyle = this.params.labelColor;
        cc.font = (this.params.fontPxSize + "px" + " " + this.params.fontType);

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
            sTime = emulabeller.viewPort.round(emulabeller.viewPort.sS / this.sR, 6);
            eTime = emulabeller.viewPort.round(emulabeller.viewPort.eS / this.sR, 6);
            cc.fillText(emulabeller.viewPort.sS, 5, this.params.fontPxSize);
            cc.fillText(sTime, 5, this.params.fontPxSize * 2);
            var metrics = cc.measureText(sTime);
            cc.fillText(emulabeller.viewPort.eS, this.osciCanvas.width - cc.measureText(emulabeller.viewPort.eS).width - 5, this.params.fontPxSize);
            cc.fillText(eTime, this.osciCanvas.width - metrics.width - 5, this.params.fontPxSize * 2);

        }


        //draw emulabeller.viewPortselected
        if (emulabeller.viewPort.selectS !== 0 && emulabeller.viewPort.selectE !== 0) {
            var posS = emulabeller.viewPort.getPos(this.osciCanvas.width, emulabeller.viewPort.selectS);
            var posE = emulabeller.viewPort.getPos(this.osciCanvas.width, emulabeller.viewPort.selectE);
            var sDist = emulabeller.viewPort.getSampleDist(this.osciCanvas.width);

            if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
                cc.fillStyle = this.params.selectedBorderColor;
                cc.fillRect(posS + sDist / 2, 0, 1, this.osciCanvas.height);
                cc.fillStyle = this.params.labelColor;
                cc.fillText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR + (1 / this.sR), 6), posS + 5, this.params.fontPxSize);
                cc.fillText(emulabeller.viewPort.selectS, posS + 5, this.params.fontPxSize * 2);
            } else {
                cc.fillStyle = this.params.selectedAreaColor;
                cc.fillRect(posS, 0, posE - posS + sDist, this.osciCanvas.height);
                cc.strokeStyle = this.selBoundColor;
                cc.beginPath();
                cc.moveTo(posS, 0);
                cc.lineTo(posS, this.osciCanvas.height);
                cc.moveTo(posE + sDist, 0);
                cc.lineTo(posE + sDist, this.osciCanvas.height);
                cc.closePath();
                cc.stroke();
                cc.fillStyle = this.params.labelColor;
                // start values
                var tW = cc.measureText(emulabeller.viewPort.selectS).width + sDist;
                cc.fillText(emulabeller.viewPort.selectS, posS - tW - 4, this.params.fontPxSize);
                tW = cc.measureText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR, 6)).width;
                cc.fillText(emulabeller.viewPort.round(emulabeller.viewPort.selectS / this.sR - (1 / this.sR) / 2, 6), posS - tW - 4, this.params.fontPxSize * 2);
                // end values
                cc.fillText(emulabeller.viewPort.selectE, posE + 5, this.params.fontPxSize);
                cc.fillText(emulabeller.viewPort.round(emulabeller.viewPort.selectE / this.sR + (1 / this.sR) / 2, 6), posE + 5, this.params.fontPxSize * 2);
                // dur values
                // check if space
                if (posE - posS > cc.measureText(emulabeller.viewPort.round((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR, 6)).width) {
                    tW = cc.measureText(emulabeller.viewPort.selectE - emulabeller.viewPort.selectS).width;
                    cc.fillText(emulabeller.viewPort.selectE - emulabeller.viewPort.selectS - 1, posS + (posE - posS) / 2 - tW / 2, this.params.fontPxSize);
                    tW = cc.measureText(emulabeller.viewPort.round((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR, 6)).width;
                    cc.fillText(emulabeller.viewPort.round(((emulabeller.viewPort.selectE - emulabeller.viewPort.selectS) / this.sR - 1 / this.sR), 6), posS + (posE - posS) / 2 - tW / 2, this.params.fontPxSize * 2);
                }

            }
        }
        // cursor
        if (emulabeller.viewPort.curCursorPosInPercent > 0) {
            //calc cursor pos
            var posC = emulabeller.viewPort.getPos(this.osciCanvas.width, emulabeller.viewPort.curCursorPosInPercent * emulabeller.backend.currentBuffer.length);
            //draw cursor
            cc.fillStyle = this.params.playCursorColor;
            cc.strokeStyle = this.params.osciColor;
            cc.fillRect(posC - this.params.playCursorWidth / 2, 0, this.params.playCursorWidth, this.osciCanvas.height);
            cc.strokeRect(posC - this.params.playCursorWidth / 2, 0, this.params.playCursorWidth, this.osciCanvas.height);

        }
    },


    /**
     * redraws emulabeller.backend.currentBuffer onto canvas given.
     * It recalculates the peaks that are to be displayed to get the maximum
     * dynamic range visualization
     *
     * @params inMemoryCanvas canvas to draw on
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
     * @params c canvas to draw on
     */
    drawCurOsciOnCanvas: function(c) {
        var cH;
        var cW;
        if (null != c) {
            canvascc = c.getContext('2d');
            cH = c.height;
            cW = c.width;
            osciWidth = c.width;
            osciHeight = c.height;

        } else {
            canvascc = this.osciCanvas.getContext('2d');
            cH = this.osciCanvas.height;
            cW = this.osciCanvas.width;
            osciWidth = this.osciCanvas.width;
            osciHeight = this.osciCanvas.height;


        }
        canvascc.clearRect(0, 0, cW, cH);

        this.getPeaks();

        this.drawOsciOnCanvas(c);
    },


    /**
     * draws scroll markup (selected view part + scroll bar)
     * according to current view port
     * on the canvas given
     * @params inMemoryCanvas to draw on
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
        canvascc.fillStyle = this.params.selectedMinimapColor;
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