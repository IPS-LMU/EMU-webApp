EmuLabeller.Drawer.TierDrawer = {

    init: function(params) {
        this.markColor = "rgba(255, 255, 0, 0.7)";
        this.boundaryColor = 'white';
        this.selBoundColor = 'red';

        this.selMarkerColor = "rgba(0, 0, 255, 0.2)";
        this.selBoundColor = "rgba(0, 255, 0, 0.5)";

        this.cursorColor = "red";
        this.cursorWidth = 1;

    },

    drawTier: function(tierDetails, canvas) {


    },


    drawTiers: function(tierInfos, vP) {
        // console.log(tierInfos.contexts.length);
        // console.log(vP);
        var markColor = this.markColor;

        var curcc;
        var curCanv;
        for (var i = 0; i <= tierInfos.contexts.length - 1; i++) {
            //console.log("here");
            curCanv = tierInfos.canvases[i];
            curcc = tierInfos.contexts[i];
            var curCanHeight = curCanv.height;
            var curCanWidth = curCanv.width;
            curcc.clearRect(0, 0, curCanWidth, curCanHeight);

            //highlight selected tier 
            if (vP.selTier == i) {
                curcc.fillStyle = "rgba(255, 255, 255, 0.07)";
                curcc.fillRect(0, 0, curCanv.width, curCanv.height);
                curcc.fillStyle = "rgb(0, 0, 0)";
            }
            // console.log("------------");
            // console.log(vP.selTier);
            // console.log(vP.selSegment);

            var all = vP.eS - vP.sS;
            var fracS = vP.selectS - vP.sS;
            var procS = fracS / all;
            var posS = this.osciWidth * procS;

            var fracE = vP.selectE - vP.sS;
            var procE = fracE / all;
            var posE = this.osciWidth * procE;

            // curcc.strokeStyle = "rgba(0, 255, 0, 0.5)";
            // curcc.beginPath();
            // curcc.moveTo(posS, 0);
            // curcc.lineTo(posS, curCanHeight);
            // curcc.moveTo(posE, 0);
            // curcc.lineTo(posE, curCanHeight);
            // curcc.stroke();

            //cirle with diam 5 for clicking range
            // if (vP.selectS == vP.selectE) {
            //     curcc.beginPath();
            //     curcc.arc(posS, 5, 5, 0, 2 * Math.PI, false);
            //     curcc.stroke();
            // }

            // draw name of tier
            curcc.strokeStyle = this.boundaryColor;
            curcc.font = "12px Verdana";
            curcc.strokeText(tierInfos.tiers[i].TierName, 5, 5 + 8);
            curcc.strokeText("(" + tierInfos.tiers[i].type + ")", 5, 20 + 8);

            var cI = tierInfos.tiers[i];

            var ev, perc, tW, prevPerc;
            if (cI.type == "seg") {
                curcc.fillStyle = this.boundaryColor;
                //draw seg
                for (curEv = 0; curEv < cI.events.length; curEv++) {
                    if (cI.events[curEv].time > vP.sS) { //&& cI.events[curEv].time < vP.eS){
                        perc = (cI.events[curEv].time - vP.sS) / (vP.eS - vP.sS);
                        curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight);
                        // mark selected segment with markColor == yellow
                        if (vP.segmentsLoaded && vP.selectedSegments[i][curEv]) {
                            prevPerc = (cI.events[curEv - 1].time - vP.sS) / (vP.eS - vP.sS);
                            curcc.fillStyle = markColor;
                            curcc.fillRect(curCanWidth * prevPerc + 1, 0, curCanWidth * perc - curCanWidth * prevPerc - 1, curCanHeight);
                            curcc.fillStyle = this.boundaryColor;
                        } else if (vP.segmentsLoaded && curEv > 0 && emulabeller.isSelectNeighbour(i, curEv)) {
                            prevPerc = (cI.events[curEv - 1].time - vP.sS) / (vP.eS - vP.sS);
                            curcc.fillStyle = "rgba(255, 0, 0, 0.1)";
                            curcc.fillRect(curCanWidth * prevPerc + 1, 0, curCanWidth * perc - curCanWidth * prevPerc - 1, curCanHeight);
                            curcc.fillStyle = this.boundaryColor;

                        }
                        //console.log(cI.TierName+":"+vP.curMouseTierName);
                        // mark boundary closest to mouse red (only checks first element in selBoundries for now)

                        if (curEv == vP.selBoundaries[0] && i == vP.selTier) {
                            if (vP.segmentsLoaded && emulabeller.internalMode != emulabeller.EDITMODE.LABEL_MOVE) {
                                if (vP.selectedSegments[i][curEv] != vP.selectedSegments[i][curEv + 1]) {
                                    curcc.fillStyle = "rgba(255, 0, 0, 1)";
                                    curcc.fillRect(Math.ceil(curCanWidth * perc) - 1, 0, 2, curCanHeight);
                                    curcc.fillStyle = this.boundaryColor;
                                }
                            }
                        }
                        // draw label 
                        if (cI.events[curEv].label != 'H#') {
                            tW = curcc.measureText(cI.events[curEv].label).width;
                            curcc.strokeText(cI.events[curEv].label, curCanWidth * perc - tW - 10, curCanHeight / 2);
                        }
                    }
                    if (cI.events[curEv].end > vP.sS && cI.events[curEv].end < vP.eS) {
                        perc = (cI.events[curEv].end - vP.sS) / (vP.eS - vP.sS);
                        curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight);
                    }
                }

            } else if (cI.type == "point") {
                curcc.fillStyle = this.boundaryColor;
                for (curEv = 0; curEv < cI.events.length; curEv++) {
                    if (cI.events[curEv].time > vP.sS && cI.events[curEv].time < vP.eS) {
                        // mark boundary closest to mouse red (only checks first element in selBoundries for now)
                        if (curEv == vP.selBoundaries[0] && cI.TierName == vP.curMouseTierID) {
                            curcc.fillStyle = this.selBoundColor;
                        } else {
                            curcc.fillStyle = this.boundaryColor;
                        }
                        perc = (cI.events[curEv].time - vP.sS) / (vP.eS - vP.sS);
                        curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight / 2 - curCanHeight / 10);

                        tW = curcc.measureText(cI.events[curEv].label).width;
                        curcc.strokeText(cI.events[curEv].label, curCanWidth * perc - tW / 2 + 1, curCanHeight / 2);

                        curcc.fillRect(curCanWidth * perc, curCanHeight / 2 + curCanHeight / 10, 1, curCanHeight / 2 - curCanHeight / 10);
                    }
                }
            }

        }
    },

    /**
     * draw view port markup of single tier
     */
    drawVpMarkupSingleTier: function(vP, canvas) {
        var my = this;
        cc = canvas.getContext('2d');

        //calculate positions in view (refactor)
        var all = vP.eS - vP.sS;
        var fracS = vP.selectS - vP.sS;
        var procS = fracS / all;
        var posS = canvas.width * procS;

        var fracE = vP.selectE - vP.sS;
        var procE = fracE / all;
        var posE = canvas.width * procE;

        cc.strokeStyle = this.selBoundColor;
        cc.fillStyle = this.selBoundColor;

        //draw sel boundaries if not separate then single line with circle
        if (vP.selectS == vP.selectE) {
            cc.beginPath();
            cc.arc(posS, 5, 5, 0, 2 * Math.PI, false); // fixed 10 px circle
            cc.stroke();
            cc.fill();
            cc.beginPath();
            cc.moveTo(posS, 10);
            cc.lineTo(posS, canvas.height);
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


        // draw cursor
        cc.strokeStyle = this.cursorColor;

        var w = this.cursorWidth;
        var h = canvas.height;

        var x = Math.min(canvas.width * vP.curCursorPosInPercent);
        var y = 0;

        cc.fillStyle = this.cursorColor;
        if (x > 0) {
            cc.fillRect(x, y, w, h);
        }

    },

    /**
    * iterate over all tiers in tierInfos and
    * apply the according markup to them 
    * dependent on the iformation specified in 
    * the current vP
    *
    * @param vP current view port
    * @param tierInfos current tierInfos object
    */
    drawVpMarkupAllTiers: function(vP, tierInfos) {

        for (var i = 0; i <= tierInfos.tiers.length - 1; i++) {
            this.drawVpMarkupSingleTier(vP, tierInfos.canvases[i]);
        }
    }

};