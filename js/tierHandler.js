EmuLabeller.tierHandler = {
    init: function(params){
        this.internalCanvasWidth = params.internalCanvasWidth;
        this.internalCanvasHeightSmall = params.internalCanvasHeightSmall;
        this.internalCanvasHeightBig = params.internalCanvasHeightBig;
        this.isModalShowing = false;    
        this.tierInfos = params.tierInfos;  
    },

    addTier: function(addPointTier) {
        var my = this;
        var tName = "Tier" + (this.getLength()+1);
        
        if (!addPointTier) {
            var newTier = {
                TierName: tName,
                type: "seg",
                events: [],
                uiInfos: []
            };
        } else {
            var newTier = {
                TierName: tName,
                type: "point",
                events: [],
                uiInfos: []
            };
        }
        this.addTiertoHtml(tName, "tierSettings", "#cans");
        this.tierInfos.tiers[tName] = newTier;
        this.tierInfos.tiers[tName].uiInfos.canvas = $("#" + tName)[0];
        emulabeller.drawer.updateSingleTier(this.tierInfos.tiers[tName]);
        
    },

    addLoadedTiers: function(loadedTiers) {
        var my = this;
        $.each(loadedTiers.tiers, function() {
             my.addTiertoHtml(this.TierName, "tierSettings", "#cans");
             my.tierInfos.tiers[this.TierName] = this;
             my.tierInfos.tiers[this.TierName].uiInfos.canvas = $("#" + this.TierName)[0];
        });
    },

    getLength: function() {
        var r = 0;
        var t = this.tierInfos.tiers;
        for (var k in t) r++;
        return r;
    },


    showHideTierDial: function() {
        emulabeller.isModalShowing = true;
        $("#dialog-messageSh").dialog({
            modal: true,
            close: function() {
                console.log("closing");
                emulabeller.isModalShowing = false;
            },
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                    var usrTxt = $("#dialShInput")[0].value;
                    // emulabeller.tierInfos.tiers[0] = {};
                    // emulabeller.tierInfos.canvases[0] = {};
                    $("#" + usrTxt).slideToggle();
                    emulabeller.isModalShowing = false;
                }
            }
        });
    },
    
    /**
     * append a tier
     *
     * @param myName is used ad id of canvas
     * @param myID is used in custom attr. tier-id
     * @param myCssClass is used to spec. css class
     * @param
     */
    addTiertoHtml: function(myName, myCssClass, myAppendTo) {
        $('<canvas>').attr({
            id: myName,
            width: this.internalCanvasWidth,
            height: this.internalCanvasHeightSmall
        }).addClass(myCssClass).appendTo(myAppendTo);

        $("#" + myName).bind("click", function(event) {
            emulabeller.tierHandler.handleTierClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getTierDetailsFromTierWithName(myName));
        });
        $("#" + myName).bind("dblclick", function(event) {
            emulabeller.tierHandler.handleTierDoubleClick(event.originalEvent);
        });
        $("#" + myName).bind("contextmenu", function(event) {
            emulabeller.tierHandler.handleTierClickMulti(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getTierDetailsFromTierWithName(myName));
        });
        $("#" + myName).bind("mousemove", function(event) {
            emulabeller.tierHandler.trackMouseInTiers(event, emulabeller.getX(event.originalEvent), myName);
        });
        $("#" + myName).bind("mouseout", function(event) {
            emulabeller.tierHandler.resetAllSelBoundariesInTierInfos();
            var curTierDetails = emulabeller.tierHandler.getTierDetailsFromTierWithName(myName);
            emulabeller.drawer.updateSingleTier(curTierDetails);

        });
        $("#" + myName).bind("mouseup", function(event) {
            //myMouseUp(e);
        });
        $("#" + myName).bind("mousedown", function(event) {
            //myMouseDown(e);
        });

    },
    
    /**
     * function called on mouse move in tiers
     *
     * @param percX x position percentage of
     * canvas calling this function
     * @param tierID id of canvas calling this function
     */
    trackMouseInTiers: function(event, percX, tierName) {
        if (!event.shiftKey) {
            this.resetAllSelBoundariesInTierInfos();
            var curTierDetails = this.getTierDetailsFromTierWithName(tierName);
            var curSample = emulabeller.viewPort.sS + (emulabeller.viewPort.eS - emulabeller.viewPort.sS) * percX;
            var event = this.findAndMarkNearestSegmentBoundry(curTierDetails, curSample);
            emulabeller.viewPort.curMouseSegmentName = event.label;
            emulabeller.viewPort.curMouseSegmentStart = event.startSample;
            emulabeller.viewPort.curMouseSegmentDuration = event.sampleDur;
            emulabeller.viewPort.curMouseTierName = curTierDetails.TierName;
            emulabeller.drawer.updateSingleTier(curTierDetails, percX);
        }
    },

    findAndMarkNearestSegmentBoundry: function(t, curSample, markAsSel) {
        var closestStartSample = null;
        var closestStartEvt = null;
        var e = t.events;
        for (var k in e) {
            if (closestStartSample === null || Math.abs(e[k].startSample - curSample) < Math.abs(closestStartSample - curSample)) {
                closestStartSample = e[k].startSample;
                closestStartEvt = e[k];
            }
        }
        if (markAsSel && null != closestStartEvt) {
            closestStartEvt.uiInfos.selBoundryStart = true;
        }
        return closestStartEvt;
    },    
    
    getTierDetailsFromTierWithName: function(tierName) {
        return this.tierInfos.tiers[tierName];
    },
    
    resetAllSelSegments: function() {
        var t = emulabeller.tierHandler.getTiers();
        for (var k in t) {
            t[k].uiInfos.sel = false;
            for (var j in t[k].events) {
                t[k].events[j].uiInfos.selSeg = false;   
            }
        }
    },
    
    resetAllSelBoundariesInTierInfos: function() {
        var t = emulabeller.tierHandler.getTiers();
        for (var k in t) {
            for (var j in t[k].events) {
                t[k].events[j].uiInfos.selBoundryStart = false;
                t[k].events[j].uiInfos.selBoundryEnd = false;
            }    
        }       
    },
    

    handleTierClick: function(percX, percY, tierDetails) {
        //deselect everything
        this.removeLabelDoubleClick();
        this.resetAllSelSegments();
        var rXp = tierDetails.uiInfos.canvas.width * percX;
        var rYp = tierDetails.uiInfos.canvas.height * percY;
        var sXp = tierDetails.uiInfos.canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
        
        tierDetails.uiInfos.sel = true;
       
        if (tierDetails.type == "seg") {
            var curSample = emulabeller.viewPort.sS + (emulabeller.viewPort.eS - emulabeller.viewPort.sS) * percX;

            // var nearest = this.findAndMarkNearestSegmentBoundry(tierDetails, curSample, false);
            var nearest = this.findAndMarkNearestSegmentAsSel(tierDetails, curSample);


            // nearest.uiInfos.selSeg = true;

            emulabeller.viewPort.selectS = nearest.startSample;
            emulabeller.viewPort.selectE = nearest.startSample + nearest.sampleDur;

            // var clickedEvtNr = this.getSegmentIDbySample(clickedTier, curSample);
            //     var clicked = this.countSelected(elID);
            //     var timeS = clickedTier.events[clickedEvtNr - 1].startSample;
            //     console.log(clickedTier.events)
            //     var timeE = clickedTier.events[clickedEvtNr].startSample;
            //     if (clicked > 0) {
            //         if (this.isSelectNeighbour(elID, clickedEvtNr)) {
            //             emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //             if (this.viewPort.selectS != 0 && clicked > 0) {
            //                 if (timeS < this.viewPort.selectS)
            //                     this.viewPort.selectS = timeS;
            //             } else this.viewPort.selectS = timeS;
            //             if (this.viewPort.selectE != 0 && clicked > 0) {
            //                 if (timeE > this.viewPort.selectE)
            //                     this.viewPort.selectE = timeE;
            //             }
            //         } else {
            //             my.rebuildSelect();
            //             emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //             this.viewPort.selectS = timeS;
            //             this.viewPort.selectE = timeE;
            //         }
            //     } else {
            //         emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //         this.viewPort.selectS = timeS;
            //         this.viewPort.selectE = timeE;
            //     }
        }
        emulabeller.drawBuffer();
    },
    
    
    
    handleTierClickMulti: function(percX, percY, tierDetails) {
        //deselect everything
        this.removeLabelDoubleClick();
        var rXp = tierDetails.uiInfos.canvas.width * percX;
        var rYp = tierDetails.uiInfos.canvas.height * percY;
        var sXp = tierDetails.uiInfos.canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
        
        tierDetails.uiInfos.sel = true;
       
        if (tierDetails.type == "seg") {
            var curSample = emulabeller.viewPort.sS + (emulabeller.viewPort.eS - emulabeller.viewPort.sS) * percX;

            // var nearest = this.findAndMarkNearestSegmentBoundry(tierDetails, curSample, false);
            var nearest = this.findAndMarkNearestSegmentAsSel(tierDetails, curSample);


            // nearest.uiInfos.selSeg = true;

            emulabeller.viewPort.selectS = nearest.startSample;
            emulabeller.viewPort.selectE = nearest.startSample + nearest.sampleDur;

            // var clickedEvtNr = this.getSegmentIDbySample(clickedTier, curSample);
            //     var clicked = this.countSelected(elID);
            //     var timeS = clickedTier.events[clickedEvtNr - 1].startSample;
            //     console.log(clickedTier.events)
            //     var timeE = clickedTier.events[clickedEvtNr].startSample;
            //     if (clicked > 0) {
            //         if (this.isSelectNeighbour(elID, clickedEvtNr)) {
            //             emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //             if (this.viewPort.selectS != 0 && clicked > 0) {
            //                 if (timeS < this.viewPort.selectS)
            //                     this.viewPort.selectS = timeS;
            //             } else this.viewPort.selectS = timeS;
            //             if (this.viewPort.selectE != 0 && clicked > 0) {
            //                 if (timeE > this.viewPort.selectE)
            //                     this.viewPort.selectE = timeE;
            //             }
            //         } else {
            //             my.rebuildSelect();
            //             emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //             this.viewPort.selectS = timeS;
            //             this.viewPort.selectE = timeE;
            //         }
            //     } else {
            //         emulabeller.viewPort.selectedSegments[elID][clickedEvtNr] = true;
            //         this.viewPort.selectS = timeS;
            //         this.viewPort.selectE = timeE;
            //     }
        }
        emulabeller.drawBuffer();
    },
    

    findAndMarkNearestSegmentAsSel: function(t, curSample) {
        var e = t.events;
        for (var k in e) {
            if (curSample > e[k].startSample && curSample < (e[k].startSample + e[k].sampleDur)) {
                e[k].uiInfos.selSeg = true;
                return e[k];
            }        
        }
    },

    
    getSelectedTier: function() {
        for (var k in this.tierInfos.tiers)
            if(this.tierInfos.tiers[k].uiInfos.sel) return this.tierInfos.tiers[k];      
    },
    
    getTiers: function() {
        return this.tierInfos.tiers;    
    },
    
    getTier: function(t) {
        return this.tierInfos.tiers[t];    
    },
        

    getSelectedSegmentInTier: function(t) {
        var e = t.events;
        for (var k in e) {
            if(e[k].uiInfos.selSeg) return e[k];        
        }
    },
    

    handleTierDoubleClick: function(e) {
        var my = this;
        if ($('#textAreaPopUp').length === 0) {
            var tier = this.getSelectedTier();
            if (tier.type == "seg") {
                // var tier = my.tierHandler.tierInfos.tiers[emulabeller.viewPort.selTier];
                // var event = tier.events[my.getSelectedSegmentDoubleClick(emulabeller.viewPort.selTier)];
                var event = this.getSelectedSegmentInTier(tier);
                var posS = emulabeller.viewPort.getPos(tier.uiInfos.canvas.clientWidth, emulabeller.viewPort.selectS);
                var posE = emulabeller.viewPort.getPos(tier.uiInfos.canvas.clientWidth, emulabeller.viewPort.selectE);
                var textAreaX = Math.round(posS) + tier.uiInfos.canvas.offsetLeft + 2;
                var textAreaY = tier.uiInfos.canvas.offsetTop + 2;
                var textAreaWidth = Math.floor(posE - posS - 5);
                var textAreaHeight = Math.floor(tier.uiInfos.canvas.height / 2 - 5);
                var textArea = "<div id='textAreaPopUp' class='textAreaPopUp' style='top:" + textAreaY + "px;left:" + textAreaX + "px;'><textarea id='editArea' class='editArea'  wrap='off' style='width:" + textAreaWidth + "px;height:" + textAreaHeight + "px;'>" + event.label + "</textarea>";
                var saveButton = "<input type='button' value='save' id='saveText' class='mini-btn saveText'></div>";
                var appendString = textArea + saveButton;
                $("#tiers").append(appendString);
                emulabeller.internalMode = emulabeller.EDITMODE.LABEL_RENAME;
                $("#saveText")[0].addEventListener('click', function(e) {
                    my.saveLabelDoubleClick();
                });
                $("#editArea")[0].onkeyup = function(evt) { //TODO remove \n
                    evt = evt || window.event;
                    if (evt.keyCode == 13) {
                        my.saveLabelDoubleClick();
                        my.removeLabelDoubleClick();
                    }
                };
                my.createSelection(document.getElementById('editArea'), 0, event.label.length); // select textarea text 
                
            } else if (tier.type == "point") {
                alert("no point editing yet! Sorry...");
            }
        } else {
            my.removeLabelDoubleClick();
        }
    },    

    isSelectNeighbour: function(row, newId) {
        return (this.isRightSelectNeighbour(row, newId) || this.isLeftSelectNeighbour(row, newId));
    },


    isRightSelectNeighbour: function(row, newId) {
        if (newId == this.viewPort.selectedSegments[row].length)
            return false;
        else
            return this.viewPort.selectedSegments[row][newId + 1];
    },

    isLeftSelectNeighbour: function(row, newId) {
        if (newId === 0)
            return false;
        else
            return this.viewPort.selectedSegments[row][newId - 1];
    },

    createSelection: function(field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else if (field.selectionStart) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    },

    saveLabelDoubleClick: function() {
        var tierDetails = this.getSelectedTier();
        var event = this.getSelectedSegmentInTier(tierDetails);
        var content = $("#editArea").val();
        event.label = content;
        emulabeller.drawer.updateSingleTier(tierDetails);
    },

    removeLabelDoubleClick: function() { //maybe rename to removeLabelBox or something
        var my = this;
        $('textarea#editArea').remove();
        $('#saveText').remove();
        $('#textAreaPopUp').remove();
    },    
    
    getSelBoundaryEventsWithSurroundingEvtsAndTiers: function() {
        var res;
        var t = this.tierInfos.tiers;
        for (var k in t)
            for (var j in t[k].events)
                if (t[k].events[j].uiInfos.selBoundryStart === true) {
                    res = {
                        'tiers': [this.tierInfos.tiers[i - 1],
                            this.tierInfos.tiers[i],
                            this.tierInfos.tiers[i + 1]
                        ],
                        'evts': [this.tierInfos.tiers[i].events[j - 1],
                            this.tierInfos.tiers[i].events[j],
                            this.tierInfos.tiers[i].events[j + 1]
                        ]
                    };
                }
        return res;
    },
    
    


    moveBoundary: function(newTime) {
        var evtsNtiers = this.getSelBoundaryEventsWithSurroundingEvtsAndTiers();
        evts = evtsNtiers.events;
        var tier = evtsNtiers.tiers[1];

        newTime = Math.round(newTime);

        var oldTime;
        var leftEdge;
        var rightEdge;


        if (tier.type == "seg") {
            oldTime = evts[1].startSample;
            leftEdge = evts[0].startSample;
            rightEdge = evts[1].startSample + evts[1].sampleDur;

            if (newTime > leftEdge && newTime < rightEdge) {
                evts[1].startSample = newTime;
                // correct for locking mode (sampleDur changes of current segment) will change in future
                if (oldTime < newTime) {
                    evts[1].sampleDur = evts[1].sampleDur + (oldTime - newTime);
                } else {
                    evts[1].sampleDur = evts[1].sampleDur - (newTime - oldTime);
                }

                // correct for locking mode (sampleDur changes of perv segment) will change in future
                evts[0].sampleDur = evts[1].startSample - evts[0].startSample;

            }
        } else {

            oldTime = evts[1].startSample;
            leftEdge = evts[0].startSample;
            rightEdge = evts[2].startSample;
            if (newTime > leftEdge && newTime < rightEdge) {
                evts[1].startSample = newTime;
            }

        }
    }
};
