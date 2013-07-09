EmuLabeller.TextGridParser = {

    toJSO: function (string) {

        var ssr = 44100; // stream sample rate SIC... do on init!!!

        var lines = string.split("\n");
        // console.log(lines);
        var l1 ="File type= \"ooTextFile\"";
        var l2 ="Object class = \"TextGrid\"";

        var tiers = [];
        var tT, tN, eT, lab;

        //meta info for labelJSO
        var labelJSO = {origSamplerate: 44100, labelEncoding: "UTF-8", tiers: []};

        if (lines[0] == l1 && lines[1] == l2){
            for (var i = 8; i < lines.length; i++) {
                var curLineEl1 = lines[i].split(/\s+/)[1];
                if(!curLineEl1) continue;
                if( curLineEl1 == "item"){
                    // get tier type
                    if(lines[i+1].split(/\s+/)[3]=="\"IntervalTier\""){
                        tT = "seg";
                    }else{
                        tT = "point";
                    }
                    // get tier name
                    tN = lines[i+2].split(/\s+/)[3].replace(/"/g, '');

                    // adding new tier
                    labelJSO.tiers.push({TierName: tN, type: tT, events: []});
                }
                if(labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length-1].type == "seg" && curLineEl1.indexOf("intervals[") === 0){
                    // parse seg tiers event
                    eT = lines[i+2].split(/\s+/)[3]*ssr; // SIC hard coded interval tier 
                    // console.log(eT);
                    lab = lines[i+3].split(/\s+/)[3].replace(/"/g, '');
                    labelJSO.tiers[labelJSO.tiers.length-1].events.push({label: lab, time: eT});
                }else if(labelJSO.tiers.length > 0 && labelJSO.tiers[labelJSO.tiers.length-1].type == "point" && curLineEl1.indexOf("points[") === 0){
                    // parse point tier event
                    eT = lines[i+1].split(/\s+/)[3]*ssr; // SIC hard coded interval tier 
                    // console.log(i, lines[i+3]);
                    lab = lines[i+2].split(/\s+/)[3].replace(/"/g, '');
                    labelJSO.tiers[labelJSO.tiers.length-1].events.push({label: lab, time: eT});
                }

            }
            // labelJSO.push(tiers);
            // console.log(JSON.stringify(labelJSO, undefined, 2));
            return labelJSO.tiers; // SIC! Return entire object!

        }else{
            alert("bad header in textgrid file!!!");
        }

    }

};