EmuLabeller.Drawer.TierDrawer = {

    init: function(params) {
        this.markColor = "rgba(255, 255, 0, 0.7)";

        this.curSelBoundColor = "#0DC5FF"; //rgba(0, 0, 255, 255)";

        this.selMarkerColor = "rgba(22, 22, 22, 0.2)";
        this.selBoundColor = "black";

        this.cursorColor = "red";
        this.cursorWidth = 1;

        this.selTierColor = "#C8C8C8";

        this.startBoundaryColor = "rgba(22, 22, 22, 0.75)";
        this.endBoundaryColor = "rgba(22, 22, 22, 0.25)";

        this.startHelperLineColor = "rgba(22, 22, 22, 0.75)";
        this.endHelperLineColor = "rgba(22, 22, 22, 0.25)";

    },

    /**
     * draw single tier
     */
    drawSingleTier: function(tierDetails, perx, pery) {
        var my = this;
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);
        var mpx = canvas.width * perx;
        var mpy = canvas.height * pery;

        if (tierDetails.TierName == emulabeller.viewPort.getSelectTier()) {
            cc.fillStyle = this.selTierColor;
            cc.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            cc.clearRect(0, 0, canvas.width, canvas.height);
        }

        // draw name of tier
        cc.strokeStyle = "black";
        cc.font = "12px Verdana";
        cc.strokeText(tierDetails.TierName, 5, 5 + 8);
        cc.strokeText("(" + tierDetails.type + ")", 5, 20 + 8);

        if (tierDetails.type == "seg") {
            cc.fillStyle = this.boundaryColor;
            // draw segments
            var e = tierDetails.events;
            for (var k in e) {
                var curEvt = e[k];
                if (curEvt.startSample > emulabeller.viewPort.sS &&
                    curEvt.startSample < emulabeller.viewPort.eS ||
                    curEvt.startSample + curEvt.sampleDur > emulabeller.viewPort.sS &&
                    curEvt.startSample + curEvt.sampleDur < emulabeller.viewPort.eS) {

                    // draw segment start
                    var posS = Math.round(emulabeller.viewPort.getPos(canvas.width, curEvt.startSample));
                    // check if selected -> if draw as marked
                    var tierId = emulabeller.viewPort.curMouseMoveTierName;
                    var segId = emulabeller.viewPort.curMouseMoveSegmentName;
                    var nowid = emulabeller.viewPort.getId(tierDetails, curEvt.label, curEvt.startSample);
                    if (tierDetails.TierName == tierId && segId == nowid) {
                        cc.fillStyle = this.curSelBoundColor;
                        cc.fillRect(posS - 4, 0, 8, canvas.height);
                    } else {
                        cc.fillStyle = this.startBoundaryColor;
                        cc.fillRect(posS, 0, 1, canvas.height / 2);
                    }

                    //draw segment end
                    var posE = Math.round(emulabeller.viewPort.getPos(canvas.width, curEvt.startSample + curEvt.sampleDur + 1));
                    // var posE=(curEvt.startSample + curEvt.sampleDur  - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                    cc.fillStyle = this.endBoundaryColor;
                    // cc.fillRect(canvas.width * posE, canvas.height / 2, 1, canvas.height);
                    cc.fillRect(posE, canvas.height / 2, 1, canvas.height);

                    if (emulabeller.viewPort.isSelected(tierDetails, curEvt.label, curEvt.startSample)) {
                        cc.fillStyle = this.markColor;
                        cc.fillRect(posS, 0, posE - posS, canvas.height);
                    }

                    // draw label 
                    cc.strokeStyle = "black";
                    cc.fillStyle = "white";
                    tW = cc.measureText(curEvt.label).width;
                    tX = posS + (posE - posS) / 2 - tW / 2;
                    //check for enough space to stroke text
                    if (posE - posS > tW) {
                        cc.strokeText(curEvt.label, tX, canvas.height / 2 + 3);
                    } 

                    //draw helper lines
                    if (posE - posS > tW * 3) {
                        cc.strokeStyle = this.startHelperLineColor;
                        cc.beginPath();
                        cc.moveTo(posS, canvas.height / 4);
                        cc.lineTo(tX + tW / 2, canvas.height / 4);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 + 10);
                        cc.stroke();

                        // // draw sample numbers.
                        cc.strokeStyle = this.startHelperLineColor;
                        tW = cc.measureText(curEvt.startSample).width;
                        //check for enough space to stroke text
                        if (posE - posS * canvas.width > tW) {
                            cc.strokeText(curEvt.startSample, posS + 5, canvas.height / 8);
                        }

                        cc.strokeStyle = this.endHelperLineColor;
                        cc.beginPath();
                        cc.moveTo(posE, canvas.height / 4 * 3);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 * 3);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 * 3 - 10);
                        cc.stroke();
                    }

                    tW = cc.measureText("dur: " + curEvt.sampleDur).width;
                    //check for enough space to stroke text
                    if (posE - posS > tW) {
                        cc.strokeText("dur: " + curEvt.sampleDur, posE - tW - 5, canvas.height - canvas.height / 8);
                    }
                }
            }
        } else if (tierDetails.type == "point") {
            cc.fillStyle = this.startBoundaryColor;
            for (curEvtNr = 0; curEvtNr < tierDetails.events.length; curEvtNr++) {
                var curEvt = tierDetails.events[curEvtNr];
                var id = emulabeller.viewPort.getId(tierDetails, curEvt.label, curEvt.startSample);
                cc.strokeStyle = "black";
                if (curEvt.startSample > emulabeller.viewPort.sS && curEvt.startSample < emulabeller.viewPort.eS) {
                    perc = (curEvt.startSample - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                    if (tierDetails.TierName == emulabeller.viewPort.curMouseMoveTierName && id == emulabeller.viewPort.curMouseMoveSegmentName) {
                        cc.fillStyle = this.curSelBoundColor;
                        cc.fillRect(canvas.width * perc, 0, 8, canvas.height / 2 - canvas.height / 10);
                        tW = cc.measureText(tierDetails.events[curEvtNr].label).width;
                        cc.strokeText(tierDetails.events[curEvtNr].label, canvas.width * perc - tW / 2 + 1, canvas.height / 2);
                        cc.fillRect(canvas.width * perc, canvas.height / 2 + canvas.height / 10, 8, canvas.height / 2 - canvas.height / 10);
                    } else {
                        cc.fillStyle = this.startBoundaryColor;
                        cc.fillRect(canvas.width * perc, 0, 1, canvas.height / 2 - canvas.height / 10);
                        tW = cc.measureText(tierDetails.events[curEvtNr].label).width;
                        cc.strokeText(tierDetails.events[curEvtNr].label, canvas.width * perc - tW / 2 + 1, canvas.height / 2);
                        cc.fillRect(canvas.width * perc, canvas.height / 2 + canvas.height / 10, 1, canvas.height / 2 - canvas.height / 10)
                    }
                    cc.strokeStyle = this.startBoundaryColor;
                    tW = cc.measureText(curEvt.startSample).width;
                    cc.strokeText(curEvt.startSample, canvas.width * perc + 5, canvas.height / 8);


                }
            }
        }
    },


    /**
     * draw view port markup of single tier
     */
    drawVpMarkupSingleTier: function(tierDetails) {
        var my = this;
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);
        var posS = emulabeller.viewPort.getPos(canvas.width, emulabeller.viewPort.selectS);
        var posE = emulabeller.viewPort.getPos(canvas.width, emulabeller.viewPort.selectE);
        var sDist = emulabeller.viewPort.getSampleDist(canvas.width);

        cc.strokeStyle = this.selBoundColor;
        cc.fillStyle = this.selBoundColor;

        //draw sel boundaries if not separate then single line with circle
        if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
            // draw clickbox + pos line
            var curPos = posS + sDist / 2;
            cc.fillRect(curPos - 5, 0, 10, 10);
            cc.beginPath();
            cc.moveTo(curPos, 10);
            cc.lineTo(curPos, canvas.height);
            cc.stroke();

        } else {
            cc.fillStyle = this.selMarkerColor;
            cc.fillRect(posS, 0, posE - posS, canvas.height);
            cc.beginPath();
            cc.moveTo(posS, 0);
            cc.lineTo(posS, canvas.height);
            cc.moveTo(posE, 0);
            cc.lineTo(posE, canvas.height);
            cc.stroke();

        }
        //calc cursor pos
        var fracC = emulabeller.viewPort.curCursorPosInPercent * emulabeller.viewPort.bufferLength - emulabeller.viewPort.sS;
        var procC = fracC / (emulabeller.viewPort.eS - emulabeller.viewPort.sS + 1);
        var posC = canvas.width * procC;

        // draw cursor
        cc.strokeStyle = this.cursorColor;

        var w = this.cursorWidth;
        var h = canvas.height;

        cc.fillStyle = this.cursorColor;
        if (posC > 0) {
            cc.fillRect(posC, 0, w, h);
        }
    }

};