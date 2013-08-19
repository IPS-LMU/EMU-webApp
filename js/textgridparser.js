EmuLabeller.TextGridParser = {
    init: function() {
        this.l1 = "File type = \"ooTextFile\"";
        this.l2 = "Object class = \"TextGrid\"";
        this.ssr = 44100; // SIC! Do on init...
    },

    /**
     * parse a textgrid string to the specified json format
     *
     * @param string TextGrid file string to be parsed
     * @param fileName name of textGrid including ext.
     * @returns a label java script object
     */
    toJSO: function(string, fileName) {

        var lines = string.split("\n");

        var tiers = [];
        var tT, tN, eT, lab;

        //meta info for labelJSO
        var labelJSO = {
            origSamplerate: 44100,
            labelEncoding: "UTF-8",
            tiers: []
        };

        if (lines[0] == this.l1 && lines[1] == this.l2) {
            for (var i = 8; i < lines.length; i++) {
                var curLineEl1 = lines[i].split(/\s+/)[1];
                if (!curLineEl1) continue;
                if (curLineEl1 == "item") {
                    // get tier type
                    if (lines[i + 1].split(/\s+/)[3] == "\"IntervalTier\"") {
                        tT = "seg";
                    } else {
                        tT = "point";
                    }
                    // get tier name
                    tN = lines[i + 2].split(/\s+/)[3].replace(/"/g, '');

                    // adding new tier
                    labelJSO.tiers.push({
                        TierName: tN,
                        type: tT,
                        events: [],
                        associatedFile: fileName
                    });
                }
                if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "seg" && (curLineEl1.indexOf("intervals") === 0) && (curLineEl1.indexOf("intervals:") !== 0)) {
                    // parse seg tiers event
                    eSt = Math.ceil(lines[i + 1].split(/\s+/)[3] * this.ssr);
                    eEt = Math.floor(lines[i + 2].split(/\s+/)[3] * this.ssr);
                    lab = lines[i + 3].split(/\s+/)[3].replace(/"/g, '');

                    // var correctFact = 0;
                    if (eSt === 0) {
                        eSt = eSt + 1; // for start first sample is 1
                    }

                    labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
                        label: lab,
                        startSample: eSt - 1, // correct so starts at 0
                        sampleDur: eEt - eSt
                    });
                } else if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "point" && curLineEl1.indexOf("points") === 0 && curLineEl1.indexOf("points:") !== 0) {
                    // parse point tier event
                    eT = lines[i + 1].split(/\s+/)[3] * this.ssr;
                    lab = lines[i + 2].split(/\s+/)[3].replace(/"/g, '');

                    labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
                        label: lab,
                        startSample: Math.round(eT)
                    });
                }

            }
            // console.log(JSON.stringify(labelJSO, undefined, 2));
            this.testForGapsInLabelJSO(labelJSO);
            return labelJSO;

        } else {
            alert("bad header in textgrid file!!! The header has to be: ", this.l1, "\n", this.l2);
        }

    },

    /**
     * converts the internal tiers format returned from tierHandler.getTiers
     * to a string containing a TextGrid file
     */
    toTextGrid: function(tiers) {
        var my = this;
        var tG = "";
        var nl = "\n";
        var t = "\t";

        // writing header infos
        tG = tG + my.l1 + nl + my.l2 + nl + nl;
        tG = tG + "xmin = " + my.findTimeOfMinSample() + nl;
        tG = tG + "xmax = " + my.findTimeOfMaxSample() + nl;
        tG = tG + "tiers? <exists>" + nl;
        tG = tG + "size = " + emulabeller.tierHandler.getLength() + nl;
        tG = tG + "item []:" + nl;
        var tierNr = 0;
        // $("#cans div canvas").each(function(){
        $("#cans div canvas").each(function(index) {
            console.log($(this).attr("id"));
            var curTier = emulabeller.tierHandler.getTier($(this).attr("id"));
            //write tier items
            tierNr = tierNr + 1;
            tG = tG + t + "item [" + tierNr + "]:" + nl;
            if (curTier.type == "seg") {
                tG = tG + t + t + 'class = "IntervalTier"' + nl;
            } else if (curTier.type == "point") {
                tG = tG + t + t + 'class = "TextTier"' + nl;
            }
            tG = tG + t + t + 'name = "' + curTier.TierName + '"' + nl;
            tG = tG + t + t + "xmin = " + my.findTimeOfMinSample() + nl;
            tG = tG + t + t + "xmax = " + my.findTimeOfMaxSample() + nl;
            if (curTier.type == "seg") {
                tG = tG + t + t + "intervals: size = " + curTier.events.length + nl;
            } else if (curTier.type == "point") {
                tG = tG + t + t + "points: size = " + curTier.events.length + nl;
            }
            for (var j = 0; j < curTier.events.length; j++) {
                var evtNr = j + 1;
                if (curTier.type == "seg") {
                    tG = tG + t + t + t + "intervals[" + evtNr + "]:" + nl;
                    if (curTier.events[j].startSample !== 0) {
                        tG = tG + t + t + t + t + "xmin = " + ((curTier.events[j].startSample) / my.ssr + ((1 / my.ssr) / 2)) + nl;
                    } else {
                        tG = tG + t + t + t + t + "xmin = " + 0 + nl;
                    }
                    if (j < curTier.events.length - 1) {
                        tG = tG + t + t + t + t + "xmax = " + ((curTier.events[j].startSample + curTier.events[j].sampleDur + 1) / my.ssr + ((1 / my.ssr) / 2)) + nl;
                    } else {
                        tG = tG + t + t + t + t + "xmax = " + my.findTimeOfMaxSample() + nl;
                    }

                    tG = tG + t + t + t + t + 'text = "' + curTier.events[j].label + '"' + nl;
                } else if (curTier.type == "point") {
                    tG = tG + t + t + t + "points[" + evtNr + "]:" + nl;
                    tG = tG + t + t + t + t + "time = " + curTier.events[j].startSample / my.ssr + nl;
                    tG = tG + t + t + t + t + 'mark = "' + curTier.events[j].label + '"' + nl;
                }
            }
        });

        // for (var tN in tiers) {
            // console.log(tN)

        // }

        // console.log(labelJSO);
        console.log(tG);
        return (tG);

    },

    /**
     *
     */
    findTimeOfMinSample: function() {
        return 0.000000; // maybe needed at some point...
    },

    /**
     *
     */
    findTimeOfMaxSample: function() {
        return emulabeller.viewPort.bufferLength / this.ssr;
    },

    /**
     * test to see if all the segments in seg tiers
     * are "snapped" -> startSample+dur+1 = startSample of next Segment
     */
    testForGapsInLabelJSO: function(labelJSO) {
        var counter = 0;
        for (var i = 0; i < labelJSO.tiers.length; i++) {
            if (labelJSO.tiers[i].type == "seg") {
                for (var j = 0; j < labelJSO.tiers[i].events.length - 1; j++) {
                    if (labelJSO.tiers[i].events[j].startSample + labelJSO.tiers[i].events[j].sampleDur + 1 != labelJSO.tiers[i].events[j + 1].startSample) {
                        // console.log("######################");
                        // console.log(labelJSO.tiers[i]);
                        // console.log(labelJSO.tiers[i].events[j]);
                        // console.log(labelJSO.tiers[i].events[j + 1]);
                        counter = counter + 1;
                    }
                }
            }
        }
        console.log("TextGridParser had: ", counter, "alignment issues found in parsed textgrid");
    }

};