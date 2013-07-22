EmuLabeller.Drawer.TierDrawer = {

    init: function(params) {
        this.markColor = "rgba(255, 255, 0, 0.7)";
        this.startBoundaryColor = "green";
        this.endBoundaryColor = "red";

        this.curSelBoundColor = "#0DC5FF";//rgba(0, 0, 255, 255)";

        this.selMarkerColor = "rgba(0, 0, 255, 0.2)";
        this.selBoundColor = "black";

        this.cursorColor = "red";
        this.cursorWidth = 1;
        
        this.deleteImage = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAA3NCSVQICAjb4U/gAAAAn1BMVEX////4YmT/dnnyTE//dnn9bnH6am34YmT3XWD2WVv2VVjsOj3oMDLlJyrjICL2VVjzUVTwR0ruPT/iHB72WVvwR0rzUVT/h4r/gob/foH/eXv/dnn/cnT9bnH/bG76am3/Zmb6ZGf4YmT3XWD/WFv2WVv/VFf2VVj0TVDyTE/2SkzwR0rvREfuQUPuPT/sOj3rNDboMDLnLTDlJyrjICIhCpwnAAAANXRSTlMAESIiMzMzMzMzMzMzMzNERERERHd3qv///////////////////////////////////////0mgXpwAAAAJcEhZcwAAHngAAB54AcurAx8AAAAYdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3Jrc0+zH04AAACVSURBVBiVbczXFoIwDAbguHGi4mqbWugQZInj/Z9NSuXAhblJvuTkB+jV4NeHY9e9g+/M2KSxFKdRY0JwWltxoo72gvRMxcxTgqrM/Qp2QWmdt+kRJ5SyzgCGao09zw3TN8yWnSNEfo3LVWdTPJIwqdbWCyN5XABUeZi+NvViG0trgHeRPgM77O6l+/04A+zb9AD+1Bf6lg3jQQJJTgAAAABJRU5ErkJggg==";
        this.selTierColor = "#C8C8C8";

    },

    /**
     * draw single tier
     */
    drawSingleTier: function(tierDetails,perx) {
        var my = this;
        var canvas = tierDetails.uiInfos.canvas;
        var cc = canvas.getContext('2d');
        var mpx = canvas.width * perx;
        if(mpx>canvas.width-32) {
            var icon = new Image();
            icon.onload = function() {
                cc.drawImage(icon, 0, 0, 16, 16, (canvas.width-40), 10, 32, 32);
            };        
            icon.src = my.deleteImage;
            $('body').css('cursor', 'pointer'); 
        }
        else {        
            $('body').css('cursor', 'auto'); 
            if(tierDetails.uiInfos.sel){
                cc.fillStyle = this.selTierColor;
                cc.fillRect(0, 0, canvas.width, canvas.height);
            }else{
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
                    if (curEvt.startSample > emulabeller.viewPort.sS && curEvt.startSample < emulabeller.viewPort.eS 
                        || curEvt.startSample+curEvt.sampleDur > emulabeller.viewPort.sS && curEvt.startSample+curEvt.sampleDur < emulabeller.viewPort.eS) {
                        // draw segment start
                        var percS = (curEvt.startSample - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                        // check if selected -> if draw as marked
                        
                        
                       
                        if (curEvt.uiInfos.selBoundryStart) {
                            cc.fillStyle = this.curSelBoundColor;
                            cc.fillRect(canvas.width * percS, 0, 1, canvas.height);
                        } else {
                            // console.log(curEvt);
                            cc.fillStyle = this.startBoundaryColor;
                            cc.fillRect(canvas.width * percS, 0, 1, canvas.height / 2);
                        }

                        //draw segment end
                        var percE = (curEvt.startSample + curEvt.sampleDur - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                        // check if selected -> if draw as marked
                        if (curEvt.uiInfos.selBoundryEnd) {
                            cc.fillStyle = this.curSelBoundColor;
                            cc.fillRect(canvas.width * percE, canvas.height / 2, 1, canvas.height);
                        } else {
                            cc.fillStyle = this.endBoundaryColor;
                            cc.fillRect(canvas.width * percE, canvas.height / 2, 1, canvas.height);
                        }

                        // mark selected segment with markColor == yellow
                        //if (curEvt.uiInfos.selSeg) {
                         if(emulabeller.viewPort.isSelected(tierDetails.TierName,curEvt.startSample)) {
                            cc.fillStyle = this.markColor;
                            cc.fillRect(canvas.width * percS, 0, percE*canvas.width-percS*canvas.width, canvas.height);
                        }

                        // draw label 
                        cc.strokeStyle = "black";
                        cc.fillStyle = "white";
                        tW = cc.measureText(curEvt.label).width;
                        tX = canvas.width * (percS+(percE-percS)/2)-tW/2;
                        cc.strokeText(curEvt.label, tX, canvas.height/2+3);

                        //draw helper lines
                        cc.strokeStyle = "rgba(0,255,0,0.5)";
                        cc.beginPath();
                        cc.moveTo(percS*canvas.width, canvas.height/4);
                        cc.lineTo(tX+tW/2, canvas.height/4);
                        cc.lineTo(tX+tW/2, canvas.height/4+10);
                        cc.stroke();

                        cc.strokeStyle = "rgba(255,0,0,0.2)";
                        cc.beginPath();
                        cc.moveTo(percE*canvas.width, canvas.height/4*3);
                        cc.lineTo(tX+tW/2, canvas.height/4*3);
                        cc.lineTo(tX+tW/2, canvas.height/4*3-10);
                        cc.stroke();
                    }
                }
            } else if (tierDetails.type == "point") {
                cc.fillStyle = this.startBoundaryColor;
                for (curEvtNr = 0; curEvtNr < tierDetails.events.length; curEvtNr++) {
                    var curEvt = tierDetails.events[curEvtNr];

                    if (tierDetails.events[curEvtNr].startSample > emulabeller.viewPort.sS && tierDetails.events[curEvtNr].startSample < emulabeller.viewPort.eS) {
                        perc = (tierDetails.events[curEvtNr].startSample - emulabeller.viewPort.sS) / (emulabeller.viewPort.eS - emulabeller.viewPort.sS);
                    
                        if (curEvt.uiInfos.selBoundryStart) {
                            cc.fillStyle = this.curSelBoundColor;
                        }else{
                            cc.fillStyle = this.startBoundaryColor;
                        }
                        cc.fillRect(canvas.width * perc, 0, 1, canvas.height / 2 - canvas.height / 10);

                        tW = cc.measureText(tierDetails.events[curEvtNr].label).width;
                        cc.strokeText(tierDetails.events[curEvtNr].label, canvas.width * perc - tW / 2 + 1, canvas.height / 2);

                        cc.fillRect(canvas.width * perc, canvas.height / 2 + canvas.height / 10, 1, canvas.height / 2 - canvas.height / 10);
                    }
                }
            }
        }
    },


    /**
     * draw view port markup of single tier
     */
    drawVpMarkupSingleTier: function(tierDetails) {
        var my = this;
        var canvas = tierDetails.uiInfos.canvas;
        cc = canvas.getContext('2d');
        var posS = emulabeller.viewPort.getPos(canvas.width, emulabeller.viewPort.selectS);
        var posE = emulabeller.viewPort.getPos(canvas.width, emulabeller.viewPort.selectE);

        cc.strokeStyle = this.selBoundColor;
        cc.fillStyle = this.selBoundColor;

        //draw sel boundaries if not separate then single line with circle
        if (emulabeller.viewPort.selectS == emulabeller.viewPort.selectE) {
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
        //calc cursor pos
        var fracC = emulabeller.viewPort.curCursorPosInPercent * emulabeller.viewPort.bufferLength - emulabeller.viewPort.sS;
        var procC = fracC / (emulabeller.viewPort.eS-emulabeller.viewPort.sS);
        var posC = canvas.width * procC;

        // draw cursor
        cc.strokeStyle = this.cursorColor;

        var w = this.cursorWidth;
        var h = canvas.height;

        cc.fillStyle = this.cursorColor;
        if (posC > 0) {
            cc.fillRect(posC, 0, w, h);
        }
    },

  

    // drawTiers: function(tierInfos, vP) {
    //     // console.log(tierInfos.contexts.length);
    //     // console.log(vP);
    //     var markColor = this.markColor;

    //     var curcc;
    //     var curCanv;
    //     for (var i = 0; i <= tierInfos.contexts.length - 1; i++) {
    //         //console.log("here");
    //         curCanv = tierInfos.canvases[i];
    //         curcc = tierInfos.contexts[i];
    //         var curCanHeight = curCanv.height;
    //         var curCanWidth = curCanv.width;
    //         curcc.clearRect(0, 0, curCanWidth, curCanHeight);

    //         //highlight selected tier 
    //         if (vP.selTier == i) {
    //             curcc.fillStyle = "rgba(255, 255, 255, 0.07)";
    //             curcc.fillRect(0, 0, curCanv.width, curCanv.height);
    //             curcc.fillStyle = "rgb(0, 0, 0)";
    //         }
    //         // console.log("------------");
    //         // console.log(vP.selTier);
    //         // console.log(vP.selSegment);

    //         var all = vP.eS - vP.sS;
    //         var fracS = vP.selectS - vP.sS;
    //         var procS = fracS / all;
    //         var posS = this.osciWidth * procS;

    //         var fracE = vP.selectE - vP.sS;
    //         var procE = fracE / all;
    //         var posE = this.osciWidth * procE;

    //         // curcc.strokeStyle = "rgba(0, 255, 0, 0.5)";
    //         // curcc.beginPath();
    //         // curcc.moveTo(posS, 0);
    //         // curcc.lineTo(posS, curCanHeight);
    //         // curcc.moveTo(posE, 0);
    //         // curcc.lineTo(posE, curCanHeight);
    //         // curcc.stroke();

    //         //cirle with diam 5 for clicking range
    //         // if (vP.selectS == vP.selectE) {
    //         //     curcc.beginPath();
    //         //     curcc.arc(posS, 5, 5, 0, 2 * Math.PI, false);
    //         //     curcc.stroke();
    //         // }

    //         // draw name of tier
    //         curcc.strokeStyle = this.boundaryColor;
    //         curcc.font = "12px Verdana";
    //         curcc.strokeText(tierInfos.tiers[i].TierName, 5, 5 + 8);
    //         curcc.strokeText("(" + tierInfos.tiers[i].type + ")", 5, 20 + 8);

    //         var cI = tierInfos.tiers[i];

    //         var ev, perc, tW, prevPerc;
    //         if (cI.type == "seg") {
    //             curcc.fillStyle = this.boundaryColor;
    //             //draw seg
    //             for (curEv = 0; curEv < cI.events.length; curEv++) {
    //                 if (cI.events[curEv].startSample > vP.sS) { //&& cI.events[curEv].time < vP.eS){
    //                     perc = (cI.events[curEv].startSample - vP.sS) / (vP.eS - vP.sS);
    //                     curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight);
    //                     // mark selected segment with markColor == yellow
    //                     if (vP.segmentsLoaded && vP.selectedSegments[i][curEv]) {
    //                         prevPerc = (cI.events[curEv - 1].startSample - vP.sS) / (vP.eS - vP.sS);
    //                         curcc.fillStyle = markColor;
    //                         curcc.fillRect(curCanWidth * prevPerc + 1, 0, curCanWidth * perc - curCanWidth * prevPerc - 1, curCanHeight);
    //                         curcc.fillStyle = this.boundaryColor;
    //                     } else if (vP.segmentsLoaded && curEv > 0 && emulabeller.isSelectNeighbour(i, curEv)) {
    //                         prevPerc = (cI.events[curEv - 1].startSample - vP.sS) / (vP.eS - vP.sS);
    //                         curcc.fillStyle = "rgba(255, 0, 0, 0.1)";
    //                         curcc.fillRect(curCanWidth * prevPerc + 1, 0, curCanWidth * perc - curCanWidth * prevPerc - 1, curCanHeight);
    //                         curcc.fillStyle = this.boundaryColor;

    //                     }
    //                     //console.log(cI.TierName+":"+vP.curMouseTierName);
    //                     // mark boundary closest to mouse red (only checks first element in selBoundries for now)

    //                     if (curEv == vP.selBoundaries[0] && i == vP.selTier) {
    //                         if (vP.segmentsLoaded && emulabeller.internalMode != emulabeller.EDITMODE.LABEL_MOVE) {
    //                             if (vP.selectedSegments[i][curEv] != vP.selectedSegments[i][curEv + 1]) {
    //                                 curcc.fillStyle = "rgba(255, 0, 0, 1)";
    //                                 curcc.fillRect(Math.ceil(curCanWidth * perc) - 1, 0, 2, curCanHeight);
    //                                 curcc.fillStyle = this.boundaryColor;
    //                             }
    //                         }
    //                     }
    //                     // draw label 
    //                     if (cI.events[curEv].label != 'H#') {
    //                         tW = curcc.measureText(cI.events[curEv].label).width;
    //                         curcc.strokeText(cI.events[curEv].label, curCanWidth * perc - tW - 10, curCanHeight / 2);
    //                     }
    //                 }
    //                 if (cI.events[curEv].end > vP.sS && cI.events[curEv].end < vP.eS) {
    //                     perc = (cI.events[curEv].end - vP.sS) / (vP.eS - vP.sS);
    //                     curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight);
    //                 }
    //             }

    //         } else if (cI.type == "point") {
    //             curcc.fillStyle = this.boundaryColor;
    //             for (curEv = 0; curEv < cI.events.length; curEv++) {
    //                 if (cI.events[curEv].startSample > vP.sS && cI.events[curEv].startSample < vP.eS) {
    //                     // mark boundary closest to mouse red (only checks first element in selBoundries for now)
    //                     if (curEv == vP.selBoundaries[0] && cI.TierName == vP.curMouseTierID) {
    //                         curcc.fillStyle = this.selBoundColor;
    //                     } else {
    //                         curcc.fillStyle = this.boundaryColor;
    //                     }
    //                     perc = (cI.events[curEv].startSample - vP.sS) / (vP.eS - vP.sS);
    //                     curcc.fillRect(curCanWidth * perc, 0, 1, curCanHeight / 2 - curCanHeight / 10);

    //                     tW = curcc.measureText(cI.events[curEv].label).width;
    //                     curcc.strokeText(cI.events[curEv].label, curCanWidth * perc - tW / 2 + 1, curCanHeight / 2);

    //                     curcc.fillRect(curCanWidth * perc, curCanHeight / 2 + curCanHeight / 10, 1, curCanHeight / 2 - curCanHeight / 10);
    //                 }
    //             }
    //         }

    //     }
    // },

};