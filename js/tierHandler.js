EmuLabeller.tierHandler = {
    init: function(params){
        this.internalCanvasWidth = params.internalCanvasWidth;
        this.internalCanvasHeightSmall = params.internalCanvasHeightSmall;
        this.internalCanvasHeightBig = params.internalCanvasHeightBig;
        this.isModalShowing = false;        
    },

    addTier: function(addPointTier) {
        var my = this;

        var tName = "Tier" + my.tierCounter;
        if (!addPointTier) {
            this.tierInfos.tiers.push({
                TierName: tName,
                type: "seg",
                events: []
            });
        } else {
            this.tierInfos.tiers.push({
                TierName: tName,
                type: "point",
                events: []
            });
        }
        this.addTiertoHtml(tName, my.tierCounter, "tierSettings", "#cans");
        emulabeller.tierInfos.canvases.push($("#" + tName)[0]);
        emulabeller.drawer.addTier($("#" + tName)[0]);
        ++my.tierCounter;
        this.drawBuffer();
        this.rebuildSelect();
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
    addTiertoHtml: function(myName, myID, myCssClass, myAppendTo) {
        $('<canvas>').attr({
            id: myName,
            width: this.internalCanvasWidth,
            height: this.internalCanvasHeightSmall,
            'tier-id': myID
        }).addClass(myCssClass).appendTo(myAppendTo);

        $("#" + myName).bind("click", function(event) {
            emulabeller.handleTierClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.getTierDetailsFromTierWithName(myName));
        });
        $("#" + myName).bind("dblclick", function(event) {
            emulabeller.handleTierDoubleClick(event.originalEvent);
        });
        $("#" + myName).bind("contextmenu", function(event) {
            emulabeller.setMarkedEvent(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), myName);
        });
        $("#" + myName).bind("mousemove", function(event) {
            emulabeller.trackMouseInTiers(event, emulabeller.getX(event.originalEvent), myName);
        });
        $("#" + myName).bind("mouseout", function(event) {
            emulabeller.resetAllSelBoundariesInTierInfos();
            var curTierDetails = emulabeller.getTierDetailsFromTierWithName(myName);
            emulabeller.drawer.updateSingleTier(emulabeller.viewPort, curTierDetails);

        });
        $("#" + myName).bind("mouseup", function(event) {
            //myMouseUp(e);
        });
        $("#" + myName).bind("mousedown", function(event) {
            //myMouseDown(e);
        });

    }  

};
