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

        this.segmentsLoaded = false;
        this.selectedSegments = []; // [Tiers][Segments]

        // this.selTier = -1; // -1 == no segment selected
        this.curMouseTierName = "";
        this.curMouseTierID = -1;
        this.curMouseSegmentID = "";
        // this.selBoundaries = [];

        this.selectSPixel = 0;
        this.selectEPixel = 0;

        this.curCursorPosInPercent = 0.0;
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