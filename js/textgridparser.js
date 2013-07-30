EmuLabeller.TextGridParser = {
    init: function() {
        this.l1 = "File type= \"ooTextFile\"";
        this.l2 = "Object class = \"TextGrid\"";
        this.ssr = 44100; // SIC! Do on init...
    },


    toJSO: function(string) {

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
                        events: []
                    });
                }
                if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "seg" && curLineEl1.indexOf("intervals[") === 0) {
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
                        startSample: eSt - 1 , // correct so starts at 0
                        sampleDur: eEt - eSt
                    });
                } else if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "point" && curLineEl1.indexOf("points[") === 0) {
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
            alert("bad header in textgrid file!!!");
        }

    },

    /**
     * converts the internal labelJSO
     * to a string containing a TextGrid file
     * with the according segments
     * @param labelJSO
     */
    toTextGrid: function(labelJSO) {
        var tG = "";
        var nl = "\n";
        var t = "\t";

        // writing header infos
        tG = tG + this.l1 + nl + this.l2 + nl + nl;
        tG = tG + "xmin = " + this.findTimeOfMinSample(labelJSO) + nl;
        tG = tG + "xmax = " + this.findTimeOfMaxSample(labelJSO) + nl + nl;
        tG = tG + "tiers? <exists>" + nl + nl;
        tG = tG + "size = " + labelJSO.tiers.length + nl;
        tG = tG + "item []:" + nl;

        for (var i = 0; i < labelJSO.tiers.length; i++) {
            //write tier items
            var tierNr = i + 1;
            tG = tG + t + "item [" + tierNr + "]:" + nl;
            if (labelJSO.tiers[i].type == "seg") {
                tG = tG + t + t + 'class = "IntervalTier"' + nl;
            } else if (labelJSO.tiers[i].type == "point") {
                tG = tG + t + t + 'class = "TextTier"' + nl;
            }
            tG = tG + t + t + 'name = "' + labelJSO.tiers[i].TierName + '"' + nl;
            tG = tG + t + t + "xmin = " + this.findTimeOfMinSample(labelJSO) + nl;
            tG = tG + t + t + "xmax = " + this.findTimeOfMaxSample(labelJSO) + nl;
            if (labelJSO.tiers[i].type == "seg") {
                tG = tG + t + t + "intervals: size = " + labelJSO.tiers[i].events.length + nl;
            } else if (labelJSO.tiers[i].type == "point") {
                tG = tG + t + t + "points: size = " + labelJSO.tiers[i].events.length + nl;
            }
            for (var j = 0; j < labelJSO.tiers[i].events.length; j++) {
                var evtNr = j + 1;
                if (labelJSO.tiers[i].type == "seg") {
                    tG = tG + t + t + t + "intervals[" + evtNr + "]:" + nl;
                    tG = tG + t + t + t + t + "xmin = " + labelJSO.tiers[i].events[j].startSample / 44100 + nl;
                    tG = tG + t + t + t + t + "xmax = " + (labelJSO.tiers[i].events[j].startSample + labelJSO.tiers[i].events[j].sampleDur) / 44100 + nl;
                    tG = tG + t + t + t + t + 'text = "' + labelJSO.tiers[i].events[j].label + '"' + nl;
                } else if (labelJSO.tiers[i].type == "point") {
                    tG = tG + t + t + t + "points[" + evtNr + "]:" + nl;
                    tG = tG + t + t + t + t + "time = " + labelJSO.tiers[i].events[j].startSample / 44100 + nl;
                    tG = tG + t + t + t + t + 'mark = "' + labelJSO.tiers[i].events[j].label + '"' + nl;

                }

            }
        }

        // console.log(labelJSO);
        // console.log(tG);
        return (tG);

    },

    /**
     *
     */
    findTimeOfMinSample: function(labelJSO) {
        return 0.000000; // SIC!!! Find length in obj
    },

    /**
     *
     */
    findTimeOfMaxSample: function(labelJSO) {
        return 2.904450; // SIC!!! Find length in obj
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
                        console.log("######################")
                        console.log(labelJSO.tiers[i])
                        console.log(labelJSO.tiers[i].events[j])
                        console.log(labelJSO.tiers[i].events[j + 1])
                        counter = counter + 1;
                    }
                }
            }
        }
        console.log("TextGridParser had: ", counter, "alignment issues found in parsed textgrid");
    }

};