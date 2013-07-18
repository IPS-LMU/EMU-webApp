EmuLabeller.Drawer.OsciDrawer = {

    init: function() {
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

        this.forTesting = 1;

        this.sR = 44100; // SIC not good hardcoded

    },

    getPeaks: function(buffer, vP, canvas) {

        var k = (vP.eS - vP.sS) / canvas.width; // PCM Samples per new pixel

        this.peaks = [];
        this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = buffer.getChannelData(c);
        // console.log(chan);
        var relData = chan.subarray(vP.sS, vP.eS);

        if (k <= 1) {
            console.log("over sample exact!!!");
            relData = chan.subarray(vP.sS, vP.eS + 1);
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

    drawOsciOnCanvas: function(buffer, vP, canvas) {
        //this.resizeCanvases();
        var my = this;
        var cc = canvas.getContext("2d");


        var k = (vP.eS - vP.sS) / canvas.width; // PCM Samples per new pixel
        // Draw WebAudio buffer peaks using draw frame
        if (this.peaks && k >= 1) {
            this.peaks.forEach(function(peak, index) {
                if (index !== 0) {
                    my.drawFrame(index, peak, my.maxPeak, my.peaks[index - 1], canvas, buffer, vP);
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

    drawFrame: function(index, value, max, prevPeak, canvas, buffer, vP) {
        var cc = canvas.getContext('2d');
        //calculate sample of cur cursor position

        //calc cursor pos
        var all = vP.eS - vP.sS;
        var fracC = vP.curCursorPosInPercent * vP.bufferLength - vP.sS;
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

    drawVpOsciMarkup: function(buffer, canvas, vP) {
        var my = this;
        var cc = canvas.getContext("2d");
        //console.log(vP);
        cc.strokeStyle = this.waveColor;

        //this.cc.fillRect(x, y, w, h);
        cc.beginPath();
        cc.moveTo(0, 0);
        cc.lineTo(5, 5);
        cc.moveTo(canvas.width, 0);
        cc.lineTo(canvas.width - 5, 5);
        cc.moveTo(0, canvas.height / 2);
        cc.lineTo(canvas.width, canvas.height / 2);

        cc.closePath();
        cc.stroke();
        var sTime;
        var eTime;
        if (vP) {
            cc.font = "12px Verdana";
            sTime = vP.round(vP.sS/this.sR, 6);
            eTime = vP.round(vP.eS/this.sR, 6);
            var metrics = cc.measureText(sTime);
            cc.strokeText(eTime, 5, 5 + 8);
            cc.strokeText(eTime, canvas.width - metrics.width - 5, 5 + 8);
        }

        
        //draw vPselected
        if (vP.selectS !== 0 && vP.selectE !== 0) {
            var all = vP.eS - vP.sS;
            var fracS = vP.selectS - vP.sS;
            var procS = fracS / all;
            var posS = canvas.width * procS;

            var fracE = vP.selectE - vP.sS;
            var procE = fracE / all;
            var posE = canvas.width * procE;

            cc.fillStyle = this.selMarkerColor;
            cc.fillRect(posS, 0, posE - posS, canvas.height);

            cc.strokeStyle = this.selBoundColor;
            cc.beginPath();
            cc.moveTo(posS, 0);
            cc.lineTo(posS, canvas.height);
            cc.moveTo(posE, 0);
            cc.lineTo(posE, canvas.height);
            cc.closePath();
            cc.stroke();

            cc.strokeStyle = this.waveColor;
            if (vP.selectS == vP.selectE) {
                cc.strokeText(vP.selectS/this.sR, posS + 5, 13);
            } else {
                var tW = cc.measureText(vP.round(vP.selectS/this.sR, 6)).width;
                cc.strokeText(vP.round(vP.selectS/this.sR, 6), posS - tW - 4, 13);
                cc.strokeText(vP.round(vP.selectE/this.sR, 6), posE + 5, 13);

                tW = cc.measureText(vP.round((vP.selectE-vP.selectS)/this.sR,6)).width;
                cc.strokeText(vP.round(((vP.selectE-vP.selectS)/this.sR),6), posS+(posE-posS)/2 -tW/2, 13);

            }
        }
        // cursor
        if (vP.curCursorPosInPercent > 0) {
            //calc cursor pos
            var all2 = vP.eS - vP.sS;
            var fracC = vP.curCursorPosInPercent * vP.bufferLength - vP.sS;
            var procC = fracC / all2;
            var posC = canvas.width * procC;

            //draw cursor
            cc.fillStyle = this.cursorColor;
            cc.fillRect(posC, 0, this.cursorWidth, canvas.height);
            // console.log(all)

        }
    },


    /**
     * redraws buffer onto canvas given vP. It recalculates
     * the peaks that are to be displayed to get the maximum
     * dynamic range visualization
     *
     * @params buffer
     * @params canvas to draw on
     * @params bufferLength current view port
     */
    redrawOsciOnCanvas: function(buffer, canvas, vP) {
        var cH = canvas.height;
        var cW = canvas.width;

        canvascc = canvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        osciWidth = canvas.width;
        osciHeight = canvas.height;

        this.getPeaks(buffer, vP, canvas);
        this.drawOsciOnCanvas(buffer, vP, canvas);
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
    drawCurOsciOnCanvas: function(buffer, canvas, vP) {
        var cH = canvas.height;
        var cW = canvas.width;

        canvascc = canvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        osciWidth = canvas.width;
        osciHeight = canvas.height;

        // this.getPeaks(buffer, vP, canvas);
        // console.log(this.peaks);
        this.drawOsciOnCanvas(buffer, vP, canvas);
    },


    /**
     * draws scroll markup (selected view part + scroll bar)
     * according to current view port
     * on the canvas given
     * @params vP current view port
     * @params canvas canvas to draw markup on
     * @params bufferLength length of buffer in canvas
     */
    drawScrollMarkup: function(vP, canvas, inMemoryCanvas, bufferLength) {

        var cH = canvas.height;
        var cW = canvas.width;
        canvascc = canvas.getContext('2d');
        canvascc.clearRect(0, 0, cW, cH);

        //draw osci minimap
        canvascc.drawImage(inMemoryCanvas, 0, 0, cW, cH);


        var circCtl = 3;
        var curDiam = (((vP.eS - vP.sS) / bufferLength) * cW) / 2 + 2 * circCtl;

        var curCenter = (vP.sS / bufferLength * cW) + curDiam;

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