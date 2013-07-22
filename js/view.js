/**
 * Class to hold the current state of
 * the view port and some ui state variables
 * like currently selected boundaries
 */
EmuLabeller.ViewPort = {

    /**
     * init function of object. Currently the only
     * function so a "pure json" (with no init function)
     * object could also be used
     * but in future we might consider extending the
     * functionality of this class
     *
     * @param sSample start sample of view to init view with
     * @param eSample of view to init view with
     * @param bufferLength of currently loaded buffer
     */
    init: function(sSample, eSample, bufferLength) {

        this.sS = sSample;
        this.eS = eSample;

        this.selectS = 0;
        this.selectE = 0;
        this.bufferLength = bufferLength; // on init

        // red line on wave & spectro
        this.percent = -1;

        // list of selected tiers & segments
        this.uiInfo = []; // [Tiers][Segments]
        
        for (var k in emulabeller.tierHandler.getTiers()) {
            var t = emulabeller.tierHandler.getTier(k);
            this.uiInfo[t.TierName] = [];
            for (var y in t.events) {
                this.uiInfo[t.TierName][t.events[y].label] = false;
            }
        }

        // id of tier and segment mouse is on
        this.curMouseTierName = "";
        this.curMouseSegmentName = "";
        this.curMouseSegmentStart = "";
        this.curMouseSegmentDuration = "";

        this.selectSPixel = 0;
        this.selectEPixel = 0;

        this.curCursorPosInPercent = 0.0;
    },

    getPos: function(w,s) {
        return (w * (s - this.sS) / (this.eS - this.sS));
    },



    round: function(x, n) {
        if (n < 1 || n > 14) alert("error in call of round function!!");
        var e = Math.pow(10, n);
        var k = (Math.round(x * e) / e).toString();
        if (k.indexOf('.') == -1) k += '.';
        k += e.toString().substring(1);
        return k.substring(0, k.indexOf('.') + n + 1);
    }
};