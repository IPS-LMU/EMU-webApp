EmuLabeller.TextGridParser = {
    init: function() {
        this.l1 = "File type= \"ooTextFile\"";
        this.l2 = "Object class = \"TextGrid\"";
    },


    toJSO: function(string) {

        var ssr = 44100; // stream sample rate SIC... do on init!!!

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
                        uiInfos: {
                            sel: false,
                            canvas: null
                        }
                    });
                }
                if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "seg" && curLineEl1.indexOf("intervals[") === 0) {
                    // parse seg tiers event
                    eSt = lines[i + 1].split(/\s+/)[3] * ssr;
                    eEt = lines[i + 2].split(/\s+/)[3] * ssr;
                    lab = lines[i + 3].split(/\s+/)[3].replace(/"/g, '');

                    labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
                        label: lab,
                        startSample: Math.round(eSt),
                        sampleDur: Math.round(eEt - eSt),
                        uiInfos: {
                            selSeg: false,
                            selBoundryStart: false,
                            selBoundryEnd: false,
                            lastValues: []
                        }
                    });
                } else if (labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length - 1].type == "point" && curLineEl1.indexOf("points[") === 0) {
                    // parse point tier event
                    eT = lines[i + 1].split(/\s+/)[3] * ssr;
                    lab = lines[i + 2].split(/\s+/)[3].replace(/"/g, '');

                    labelJSO.tiers[labelJSO.tiers.length - 1].events.push({
                        label: lab,
                        startSample: Math.round(eT),
                        uiInfos: {
                            selBoundryStart: false,
                            lastValues: []
                        }
                    });
                }

            }
            //console.log(JSON.stringify(labelJSO, undefined, 2));
            return labelJSO; // SIC! All durations are null

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

        // writing header infos
        tG = tG + this.l1 + nl + this.l2 + nl + nl;
        tG = tG + "xmin = " + this.findTimeOfMinSample(labelJSO) + nl;
        tG = tG + "xmax = " + this.findTimeOfMaxSample(labelJSO) + nl + nl;
        tG = tG + "tiers? <exists>" + nl + nl;
        tG = tG + "size = " + labelJSO.tiers.length + nl;
        tG = tG + "item []:" + nl;

        console.log(tG);

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
    }

};