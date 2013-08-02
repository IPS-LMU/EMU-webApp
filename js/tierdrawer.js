EmuLabeller.Drawer.TierDrawer = {

    defaultParams: {}, // use if wish to overwrite drawer colors

    /**
     * overwrite defaultParams
     * that are passed in and init this.params
     */
    init: function(params) {
        var my = this;
        this.params = Object.create(params);
        Object.keys(this.defaultParams).forEach(function(key) {
            if (!(key in params)) {
                params[key] = my.defaultParams[key];
            }
        });
    },

    /**
     * draw single tier
     * @param tierDetails
     * @param perx
     * @param pery
     */
    drawSingleTier: function(tierDetails, perx, pery) {

        var my = this;
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);
        var mpx = canvas.width * perx;
        var mpy = canvas.height * pery;

        if (tierDetails.TierName == emulabeller.viewPort.getSelectTier()) {
            cc.clearRect(0, 0, canvas.width, canvas.height);
            cc.fillStyle = this.params.selectedTierColor;
            cc.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            cc.clearRect(0, 0, canvas.width, canvas.height);
        }

        // draw name of tier
        cc.fillStyle = this.params.labelColor;
        cc.font = (this.params.fontPxSize + "px" + " " + this.params.fontType);
        cc.fillText(tierDetails.TierName, 5, this.params.fontPxSize);
        cc.fillText("(" + tierDetails.type + ")", 5, this.params.fontPxSize * 2);

        if (tierDetails.type == "seg") {
            // cc.fillStyle = this.params.startBoundaryColor;
            // draw segments
            var e = tierDetails.events;
            for (var k in e) {
                var curEvt = e[k];
                if (curEvt.startSample > emulabeller.viewPort.sS &&
                    curEvt.startSample < emulabeller.viewPort.eS || //within segment
                    curEvt.startSample + curEvt.sampleDur > emulabeller.viewPort.sS &&
                    curEvt.startSample + curEvt.sampleDur < emulabeller.viewPort.eS || //end in segment
                    curEvt.startSample < emulabeller.viewPort.sS &&
                    curEvt.startSample + curEvt.sampleDur > emulabeller.viewPort.eS // within sample
                ) {

                    // draw segment start
                    var posS = Math.round(emulabeller.viewPort.getPos(canvas.width, curEvt.startSample));
                    // check if selected -> if draw as marked
                    var tierId = emulabeller.viewPort.curMouseMoveTierName;
                    var segId = emulabeller.viewPort.curMouseMoveSegmentName;
                    var nowid = emulabeller.viewPort.getId(tierDetails, curEvt.label, curEvt.startSample);
                    if (tierDetails.TierName == tierId && segId == nowid) {
                        cc.fillStyle = this.params.selectedBoundaryColor;
                        cc.fillRect(posS - 4, 0, 8, canvas.height);
                    } else {
                        cc.fillStyle = this.params.startBoundaryColor;
                        cc.fillRect(posS, 0, 1, canvas.height / 2);
                    }

                    //draw segment end
                    var posE = Math.round(emulabeller.viewPort.getPos(canvas.width, curEvt.startSample + curEvt.sampleDur + 1) );
                    cc.fillStyle = this.params.endBoundaryColor;
                    cc.fillRect(posE, canvas.height / 2, 1, canvas.height);

                    if (emulabeller.viewPort.isSelected(tierDetails, curEvt.label, curEvt.startSample)) {
                        cc.fillStyle = this.params.selectedSegmentColor;
                        cc.fillRect(posS, 0, posE - posS, canvas.height);
                    }

                    // draw label 
                    // cc.strokeStyle = this.;
                    cc.fillStyle = this.params.labelColor;
                    tW = cc.measureText(curEvt.label).width;
                    tX = posS + (posE - posS) / 2 - tW / 2;
                    //check for enough space to stroke text
                    if (posE - posS > tW) {
                        cc.fillText(curEvt.label, tX, canvas.height / 2 + 3);
                    }

                    //draw helper lines
                    if (posE - posS > cc.measureText("m").width * 3) {
                        // start helper line
                        cc.strokeStyle = this.params.startBoundaryColor;
                        cc.beginPath();
                        cc.moveTo(posS, canvas.height / 4);
                        cc.lineTo(tX + tW / 2, canvas.height / 4);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 + 10);
                        cc.stroke();

                        // draw startSample numbers
                        cc.fillStyle = this.params.startBoundaryColor;
                        var sStW = cc.measureText(curEvt.startSample).width;
                        //check for enough space to stroke text
                        if (posE - posS > sStW) {
                            cc.fillText(curEvt.startSample, posS + 5, canvas.height / 8 + this.params.fontPxSize / 2);
                        }
                        // end helper line
                        cc.strokeStyle = this.params.endBoundaryColor;
                        cc.beginPath();
                        cc.moveTo(posE, canvas.height / 4 * 3);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 * 3);
                        cc.lineTo(tX + tW / 2, canvas.height / 4 * 3 - 10);
                        cc.stroke();
                    }
                    // draw sampleDur numbers.
                    cc.fillStyle = this.params.endBoundaryColor;
                    var sDtW = cc.measureText("dur: " + curEvt.sampleDur).width;
                    //check for enough space to stroke text
                    if (posE - posS > sDtW) {
                        cc.fillText("dur: " + curEvt.sampleDur, posE - sDtW - 5, canvas.height - canvas.height / 8);
                    }
                }
            }
        } else if (tierDetails.type == "point") {
            cc.fillStyle = this.params.startBoundaryColor;

            for (k in tierDetails.events) {

                //for (curEvtNr = 0; curEvtNr < tierDetails.events.length; curEvtNr++) {
                var curEvt = tierDetails.events[k];
                var id = emulabeller.viewPort.getId(tierDetails, curEvt.label, curEvt.startSample);
                if (curEvt.startSample > emulabeller.viewPort.sS && curEvt.startSample < emulabeller.viewPort.eS) {
                    perc = (curEvt.startSample - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                    if (tierDetails.TierName == emulabeller.viewPort.curMouseMoveTierName && id == emulabeller.viewPort.curMouseMoveSegmentName) {
                        cc.fillStyle = this.params.selectedBoundaryColor;
                        cc.fillRect(canvas.width * perc, 0, 8, canvas.height / 2 - canvas.height / 10);
                        cc.fillRect(canvas.width * perc, canvas.height / 2 + canvas.height / 10, 8, canvas.height / 2 - canvas.height / 10);
                        tW = cc.measureText(tierDetails.events[k].label).width;
                        cc.fillStyle = this.params.labelColor;
                        cc.fillText(tierDetails.events[k].label, canvas.width * perc - tW / 2 + 1, canvas.height / 2);
                    } else {
                        cc.fillStyle = this.params.startBoundaryColor;
                        cc.fillRect(canvas.width * perc, 0, 1, canvas.height / 2 - canvas.height / 10);
                        cc.fillRect(canvas.width * perc, canvas.height / 2 + canvas.height / 10, 1, canvas.height / 2 - canvas.height / 10)
                        tW = cc.measureText(tierDetails.events[k].label).width;
                        cc.fillStyle = this.params.labelColor;
                        cc.fillText(tierDetails.events[k].label, canvas.width * perc - tW / 2 + 1, canvas.height / 2);
                    }
                    cc.fillStyle = this.startBoundaryColor;
                    tW = cc.measureText(curEvt.startSample).width;
                    cc.fillText(curEvt.startSample, canvas.width * perc + 5, canvas.height / 8);


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

        cc.strokeStyle = this.params.selectedBorderColor;
        cc.fillStyle = this.params.selectedBorderColor;

        //draw sel boundaries if not separate then single line with circle
        if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
            if (emulabeller.viewPort.selectS !== 0) {
                // draw clickbox + pos line
                var curPos = posS + sDist / 2;
                cc.fillRect(curPos - 5, 0, 10, 10);
                cc.beginPath();
                cc.moveTo(curPos, 10);
                cc.lineTo(curPos, canvas.height);
                cc.stroke();
            }

        } else {
            cc.fillStyle = my.params.selectedAreaColor;
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