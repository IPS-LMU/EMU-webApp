EmuLabeller.Drawer.OsciDrawer = {

    init: function(params) {
        this.waveColor = 'white';

        //
        this.peaks = [];
        this.maxPeak = -Infinity;

    },

    getPeaks: function(buffer, vP, canvasWidth, canvasHeight) {

        var k = (vP.eS - vP.sS) / canvasWidth; // PCM Samples per new pixel

        this.peaks = [];
        // this.minPeak = Infinity;
        this.maxPeak = -Infinity;

        var chan = buffer.getChannelData(c);
        // console.log(chan);
        var relData = chan.subarray(vP.sS, vP.eS);

        if (k <= 1) {
            // console.log("over sample exact!!!");
            relData = chan.subarray(vP.sS, vP.eS + 1);
            // this.minPeak = Math.min.apply(Math, relData);
            this.maxPeak = Math.max.apply(Math, relData);
            this.peaks = Array.prototype.slice.call(relData);
        } else {


            for (var i = 0; i < canvasHeight; i++) {
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

        if (vP) {
            cc.font = "12px Verdana";
            var metrics = cc.measureText(Math.floor(vP.eS));
            cc.strokeText(Math.floor(vP.sS), 5, 5 + 8);
            cc.strokeText(Math.floor(vP.eS), canvas.width - metrics.width - 5, 5 + 8);
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

            cc.fillStyle = "rgba(0, 0, 255, 0.2)";
            cc.fillRect(posS, 0, posE - posS, canvas.height);

            cc.strokeStyle = "rgba(0, 255, 0, 0.5)";
            cc.beginPath();
            cc.moveTo(posS, 0);
            cc.lineTo(posS, canvas.height);
            cc.moveTo(posE, 0);
            cc.lineTo(posE, canvas.height);
            cc.closePath();
            cc.stroke();

            cc.strokeStyle = this.waveColor;
            if (vP.selectS == vP.selectE) {
                cc.strokeText(Math.floor(vP.selectS), posS + 5, 10);
            } else {
                var tW = cc.measureText(Math.floor(vP.selectS)).width;
                cc.strokeText(Math.floor(vP.selectS), posS - tW - 4, 10);
                this.cc.strokeText(Math.floor(vP.selectE), posE + 5, 10);

            }
        }
    },


    redrawOsciOnCanvas: function(buffer, canvas, vP) {
        console.log("about to draw");
        osciWidth = canvas.width;
        osciHeight = canvas.height;

        this.getPeaks(buffer, vP, canvas.width, canvas.height);
        console.log(this.peaks);
        this.drawOsciOnCanvas(buffer, vP, canvas);
    }
};