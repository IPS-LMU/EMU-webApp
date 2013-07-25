EmuLabeller.tierHandler = {
    init: function(params){
        this.internalCanvasWidth = params.internalCanvasWidth;
        this.internalCanvasHeightSmall = params.internalCanvasHeightSmall;
        this.internalCanvasHeightBig = params.internalCanvasHeightBig;
        this.isModalShowing = false;    
        this.tierInfos = params.tierInfos;  
        this.deleteImage = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAA3NCSVQICAjb4U/gAAAAn1BMVEX////4YmT/dnnyTE//dnn9bnH6am34YmT3XWD2WVv2VVjsOj3oMDLlJyrjICL2VVjzUVTwR0ruPT/iHB72WVvwR0rzUVT/h4r/gob/foH/eXv/dnn/cnT9bnH/bG76am3/Zmb6ZGf4YmT3XWD/WFv2WVv/VFf2VVj0TVDyTE/2SkzwR0rvREfuQUPuPT/sOj3rNDboMDLnLTDlJyrjICIhCpwnAAAANXRSTlMAESIiMzMzMzMzMzMzMzNERERERHd3qv///////////////////////////////////////0mgXpwAAAAJcEhZcwAAHngAAB54AcurAx8AAAAYdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3Jrc0+zH04AAACVSURBVBiVbczXFoIwDAbguHGi4mqbWugQZInj/Z9NSuXAhblJvuTkB+jV4NeHY9e9g+/M2KSxFKdRY0JwWltxoo72gvRMxcxTgqrM/Qp2QWmdt+kRJ5SyzgCGao09zw3TN8yWnSNEfo3LVWdTPJIwqdbWCyN5XABUeZi+NvViG0trgHeRPgM77O6l+/04A+zb9AD+1Bf6lg3jQQJJTgAAAABJRU5ErkJggg==";
        this.resizeImage = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgdJREFUeNqcUzFrFUEQ3t2727vknSLBGCxUtHlgESFgkTRvC0HhFRY2ljb+ALGxS2FhEWwtrAQbG0GLFAGLFySkCAnEIvJAEgKCmBASc3t3e3t7u87evZzvJZ6FA8POzs58M/PtLn784sAgEIzxslKKCSGQUjk6La7roSAIYHV7xpiO9b1+NoHdLBNlspQZKwqNmsSCcp4jxyGMUr8GIWmaLoMyKeUDrYttUPMP3bZxNt7mlZ0Zo1kUcWsvPH10zbnVDtcB/Uwr0CXZ7PPJl292F2D7PgxDVgJEUYTiOLb29el2ay3J1FHTGHCuOee3rQ1FKm729/f+zFmYXGlTNPIA50lSFkMnq5umog7IC62l0iUAIEmeqSgWKs7AVoVWl84HUxA/N3I7UqrhCjY6PeT5IYdEPcoF1gbh4fgBibjeHKd58v0g2SuqMZyB1mKQGYkvAQih9QYIFMCNQzB2/sYBwcgbji8BWq1JJOWAEIdQQrDXRKI997zx0qa0Vfl8/5wdz9o7X/vixs124A5GGO7VQFvOVl9cpTTcsQ7fDysAeB+9/HiLSfFr/tXbsefQ/b2mDowpdvnPz/N+MIGCqdkeuJhL6Xjn4pU7vS9LD7vfVp58OlX5jFy4PBdN330Hf0F3qk/mjtm1M9P9sHj0Y5VtLN5vTJ7pfgSA2fojlXd78iT/V34LMADUHCqqlDzjjQAAAABJRU5ErkJggg==";
        this.iconImageSize = 16;
        this.isSelected = false;
        this.lastSample = 0;
        this.myHistoryCounter = 0;
        this.myHistory = new Object();
        
    },
    
    history: function(tierInfos) {
        this.myHistory[this.myHistoryCounter] = jQuery.extend(true, {}, tierInfos);
        ++this.myHistoryCounter;
    },
    
    goBackHistory: function() {
        if(this.myHistoryCounter-1>0) {;
            this.tierInfos = jQuery.extend(true, {}, this.myHistory[this.myHistoryCounter-1]);
        }
        else {
            alert("no more hisory saved....");
        }
        --this.myHistoryCounter;
        emulabeller.drawBuffer();
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
        emulabeller.viewPort.addTiertoSelection(tName);
        emulabeller.drawer.updateSingleTier(this.tierInfos.tiers[tName]);

        // save history state
        this.history(this.tierInfos);
    },

    addLoadedTiers: function(loadedTiers) {
        var my = this;
        $.each(loadedTiers.tiers, function() {
             my.addTiertoHtml(this.TierName, "tierSettings", "#cans");
             my.tierInfos.tiers[this.TierName] = this;
             my.tierInfos.tiers[this.TierName].uiInfos.canvas = $("#" + this.TierName)[0];
        });
        // save history state
        this.history(this.tierInfos); 
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
        

        var action  = "<a href='#' id='"+myName+"_del' class='deleteButton'><img src='"+this.deleteImage+"' /></a>";
        var resize = " <a href='#' id='"+myName+"_res' class='resizeButton'><img src='"+this.resizeImage+"' /></a>";
        var myCan = $('<canvas>').attr({
            id: myName,
            width: this.internalCanvasWidth,
            height: this.internalCanvasHeightSmall
        }).addClass(myCssClass).add(action+resize);
        
        
        var res = $('<div class="myTest">').attr({id: "myTest"}).html(myCan);
        
        res.appendTo(myAppendTo);
        

        $("#" + myName).bind("click", function(event) {
            emulabeller.tierHandler.handleTierClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getSelectTierDetailsFromTierWithName(myName));
        });
        $("#" + myName+"_del").bind("click", function(event) {
            if(confirm("Wollen Sie '"+myName+"' wirklich loeschen?")) 
                emulabeller.tierHandler.removeTier(myName);
        });        
          $("#" + myName+"_res").bind("click", function(event) {
            emulabeller.tierHandler.resizeTier(myName);
        });        
        
        $("#" + myName).bind("dblclick", function(event) {
            emulabeller.tierHandler.handleTierDoubleClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getSelectTierDetailsFromTierWithName(myName));
        });
        $("#" + myName).bind("contextmenu", function(event) {
            emulabeller.tierHandler.handleTierClickMulti(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getSelectTierDetailsFromTierWithName(myName));
        });
        $("#" + myName).bind("mousemove", function(event) {
           if (emulabeller.tierHandler.isSelected && event.shiftKey) {
                emulabeller.internalMode = emulabeller.EDITMODE.LABEL_RESIZE;
                curSample = emulabeller.viewPort.getCurrentSample(emulabeller.getX(event.originalEvent));
                emulabeller.tierHandler.moveBoundary(curSample, myName);
                emulabeller.drawer.uiDrawUpdate();
            }
            else if (emulabeller.tierHandler.isSelected && event.altKey) {
                emulabeller.internalMode = emulabeller.EDITMODE.LABEL_MOVE;
                curSample = emulabeller.viewPort.getCurrentSample(emulabeller.getX(event.originalEvent));
                emulabeller.tierHandler.moveSegment(curSample, myName);
                emulabeller.drawer.uiDrawUpdate();
            }
            else {
                emulabeller.tierHandler.trackMouseInTiers(event, emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), myName);
            }
            emulabeller.tierHandler.lastSample = emulabeller.viewPort.getCurrentSample(emulabeller.getX(event.originalEvent));
        });
        $("#" + myName).bind("mouseout", function(event) {
            emulabeller.tierHandler.isSelected = false;
            emulabeller.viewPort.curMouseMoveTierName = "";
            emulabeller.viewPort.curMouseMoveSegmentName =  "";
            emulabeller.viewPort.curMouseMoveSegmentStart = "";
            emulabeller.viewPort.curMouseMoveSegmentDuration = "";
            emulabeller.drawer.updateSingleTier(emulabeller.tierHandler.getSelectTierDetailsFromTierWithName(myName));
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
    trackMouseInTiers: function(event, percX, percY, tierName) {
        var curTierDetails = this.getSelectTierDetailsFromTierWithName(tierName);
        var curSample = emulabeller.viewPort.sS + (emulabeller.viewPort.eS - emulabeller.viewPort.sS) * percX;
        var event = this.findAndMarkNearestSegmentBoundry(curTierDetails, curSample);
        if(null != event) {
            emulabeller.viewPort.curMouseMoveTierName = curTierDetails.TierName;
            emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(curTierDetails,event.label,event.startSample);
            emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
            emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
            emulabeller.tierHandler.isSelected = true;    
        }

        emulabeller.drawer.updateSingleTier(curTierDetails, percX, percY);
    },

    findAndMarkNearestSegmentBoundry: function(t, curSample) {
        var closestStartSample = null;
        var closestStartEvt = null;
        var e = t.events;
        for (var k in e) {
            if (closestStartSample === null || Math.abs(e[k].startSample - curSample) < Math.abs(closestStartSample - curSample)) {
                closestStartSample = e[k].startSample;
                closestStartEvt = e[k];
            }
        }
        return closestStartEvt;
    },   
  
    
    getSelectTierDetailsFromTierWithName: function(tierName) {
        return this.tierInfos.tiers[tierName];
    },
    
    removeTier: function(tierName) {
        $("#"+tierName).remove();
        $("#"+tierName+"_del").remove();
        $("#"+tierName+"_res").remove();
        delete this.tierInfos.tiers[tierName];
        
        // save history state
        this.history(this.tierInfos);
    },
    
    resizeTier: function(tierName) {
        if($("#"+tierName).height()>=63)
            $("#"+tierName).height(24);
        else
            $("#"+tierName).height(64);
    },      

    handleTierClick: function(percX, percY, tierDetails) {
        //deselect everything
        emulabeller.viewPort.setSelectTier(tierDetails.TierName);
        emulabeller.viewPort.resetSelection(tierDetails.events.length);
        this.removeLabelDoubleClick();
        var canvas = tierDetails.uiInfos.canvas;
        var cc = canvas.getContext('2d');
        
        var rXp = tierDetails.uiInfos.canvas.width * percX;
        var rYp = tierDetails.uiInfos.canvas.height * percY;
        var sXp = tierDetails.uiInfos.canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
       
        if(rXp>tierDetails.uiInfos.canvas.width-(2*emulabeller.drawer.tierDrawer.resizeImageSize)) {
            if(rYp<(2*emulabeller.drawer.tierDrawer.resizeImageSize)) {

                return false;
            }
            else if(rYp>(2*emulabeller.drawer.tierDrawer.deleteImageSize) && rYp<(4*emulabeller.drawer.tierDrawer.deleteImageSize)) {
                if(confirm("Wollen Sie '"+tierDetails.TierName+"' wirklich loeschen?")) {
                    this.removeTier(tierDetails.TierName);
                }
                
                return false;
            }
        } 
        else {
        if (tierDetails.type == "seg") {
            var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));           
            if(null!=nearest) {
                emulabeller.viewPort.curMouseMoveTierName = event.label;
                emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.MouseSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
                emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
                emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
            }
        }
        
        }               
        
        emulabeller.drawBuffer();
    },
    
    
    
    handleTierClickMulti: function(percX, percY, tierDetails) {
        
        //deselect everything
        if(emulabeller.viewPort.getSelectTier() != tierDetails.TierName) {
            emulabeller.viewPort.setSelectTier(tierDetails.TierName);
            emulabeller.viewPort.resetSelection(tierDetails.events.length);
        }        
        this.removeLabelDoubleClick();
        var canvas = tierDetails.uiInfos.canvas;
        var cc = canvas.getContext('2d');
        
        var rXp = tierDetails.uiInfos.canvas.width * percX;
        var rYp = tierDetails.uiInfos.canvas.height * percY;
        var sXp = tierDetails.uiInfos.canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
       
        if (tierDetails.type == "seg") {
            var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));
            if(null!=nearest) {
                emulabeller.viewPort.curMouseMoveTierName = event.label;
                emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.MouseSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
                emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
                if(emulabeller.viewPort.setSelectMultiSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true) == false) {
                    this.handleTierClick(percX, percY, tierDetails);
                }
            }
        }
        emulabeller.drawBuffer();
    },
    

    findNearestSegment: function(t, curSample) {
        var e = t.events;
        var r = null;
        for (var k in e) {
            if (curSample > e[k].startSample && curSample < (e[k].startSample + e[k].sampleDur)) {
                r = e[k];
            }        
        }
        return r;
    },

    
    getSelectedTier: function() {
        return this.tierInfos.tiers[emulabeller.viewPort.getSelectTier()];      
    },
    
    getTiers: function() {
        return this.tierInfos.tiers;    
    },
    
    getTier: function(t) {
        return this.tierInfos.tiers[t];    
    },
        

    handleTierDoubleClick: function(percX, percY, tierDetails) {
        var my = this;
        var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));
        emulabeller.viewPort.setSelectTier(tierDetails.TierName);
        emulabeller.viewPort.resetSelection(tierDetails.events.length);
        emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
        if ($('#textAreaPopUp').length === 0) {
            if (tierDetails.type == "seg") {
                var posS = emulabeller.viewPort.getPos(tierDetails.uiInfos.canvas.clientWidth, emulabeller.viewPort.selectS);
                var posE = emulabeller.viewPort.getPos(tierDetails.uiInfos.canvas.clientWidth, emulabeller.viewPort.selectE);
                var textAreaX = Math.round(posS) + tierDetails.uiInfos.canvas.offsetLeft + 2;
                var textAreaY = tierDetails.uiInfos.canvas.offsetTop + 2;
                var textAreaWidth = Math.floor(posE - posS - 5);
                var textAreaHeight = Math.floor(tierDetails.uiInfos.canvas.height / 2 - 5);
                var textArea = "<div id='textAreaPopUp' class='textAreaPopUp' style='top:" + textAreaY + "px;left:" + textAreaX + "px;'><textarea id='editArea' class='editArea'  wrap='off' style='width:" + textAreaWidth + "px;height:" + textAreaHeight + "px;'>" + nearest.label + "</textarea>";
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
                my.createSelection(document.getElementById('editArea'), 0, nearest.label.length); // select textarea text 
                
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
        var content = $("#editArea").val();
        console.log(emulabeller.viewPort.getSelectName());
        tierDetails.events[emulabeller.viewPort.getSelectName()].label = content.replace(/[\n\r]/g, '');  // remove new line from content with regex
        emulabeller.drawer.updateSingleTier(tierDetails);

        // save history state
        this.history(this.tierInfos);
        
    },

    removeLabelDoubleClick: function() { //maybe rename to removeLabelBox or something
        var my = this;
        $('textarea#editArea').remove();
        $('#saveText').remove();
        $('#textAreaPopUp').remove();
    },    

    moveBoundary: function(newTime, myName) {
        newTime = Math.round(newTime);
        if(null!=this.tierInfos.tiers[myName]) {
            var left = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName-1];
            var me = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName];
            var right = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName+1];
        
            if (this.tierInfos.tiers[myName].type == "seg") {
                var old = me.startSample;
            
                // moving at the center
                if(null!=left && null!=right) {
                    if (newTime > left.startSample && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                        left.sampleDur += (newTime-old);                    
                    }
                }
                // moving the last element
                else if (null!=left) {
                    if (newTime > left.startSample && newTime < (emulabeller.viewPort.eS-20)) {
                        left.sampleDur += (newTime-old);                    
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                
                }
                // moving the fist element
                else if (null!=right) {
                    if (newTime > (emulabeller.viewPort.sS+20) && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                }
            } else {
                oldTime = me.startSample;
                if(null!=left && null!=right) {
                    if (newTime > left.startSample && newTime < right.startSample) {
                        me.startSample = newTime;
                    }
                }
                // moving the last element
                else if (null!=left) {
                    if (newTime > left.startSample && newTime < (emulabeller.viewPort.eS-20)) {
                        left.sampleDur += (newTime-old);                    
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }   
                 }
                // moving the fist element
                else if (null!=right) {
                    if (newTime > (emulabeller.viewPort.sS+20) && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                }
            }
        }

        // save history state
        this.history(this.tierInfos);
        
    }, 
      

    moveSegment: function(newTime, myName) {
        changeTime = Math.round(newTime-this.lastSample);
        var t = this.tierInfos.tiers[myName];
        var doMove = false;
        var first = true;
        var last = 0;
        var l = emulabeller.viewPort.countSelected();
        if(null!=t) {
            var selected = emulabeller.viewPort.getAllSelected(t);
            for(var i=0;i<selected.length;i++) {
                if(null!=selected[i]) {
                    if(first) {
                        if( ( t.events[i].startSample + changeTime>=t.events[i-1].startSample ) && 
                            ( t.events[i+l-1].startSample + t.events[i+l-1].sampleDur + changeTime<=t.events[i+l+1].startSample ) ) {
                            doMove = true;
                            t.events[i-1].sampleDur += changeTime;
                        }
                        first = false;
                    }
                    if(doMove) {
                        t.events[i].startSample += changeTime;
                    }
                    last = i+1;
                }
            }
            if(doMove) {
                t.events[last].startSample += changeTime;
                t.events[last].sampleDur -= changeTime;
            }
        }
        
        // save history state
        this.history(this.tierInfos);
        
    }
};
