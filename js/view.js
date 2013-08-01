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

        // list of selected Segments 
        this.uiInfo = []; // [Segments]

        this.selectInfo = []; // [Segments]

        // set everything to deselect when tiers are loaded and view is init()
        this.resetSelection();

        // id of tier and segment CLICKED on
        this.MouseTierName = "";
        this.MouseSegmentName = "";

        // id of tier and segment MOVED on
        this.curMouseMoveTierName = "";
        this.curMouseMoveSegmentName = "";
        this.curMouseMoveSegmentStart = "";
        this.curMouseMoveSegmentDuration = "";

        this.selectSPixel = 0;
        this.selectEPixel = 0;

        this.curCursorPosInPercent = 0.0;
    },

    select: function(start, end) {
        this.selectS = start;
        this.selectE = end;
    },
    /**
     * get pixel position in current viewport given the canvas width
     * @param w is width of canvas
     * @param s is current sample to convert to pixel value
     */
    getPos: function(w, s) {
        return (w * (s - this.sS) / (this.eS - this.sS + 1)); // + 1 because of view (displays all samples in view)
    },

    /**
     * calculate the pixel distance between two samples
     * @param w is width of canvas
     */
    getSampleDist: function(w) {
        return this.getPos(w, this.sS + 1) - this.getPos(w, this.sS);
    },

    setSelectTier: function(n) {
        this.MouseTierName = n;
    },

    getSelectTier: function() {
        return this.MouseTierName;
    },

    getSelectName: function() {
        return this.MouseSegmentName;
    },

    setSelectName: function(n) {
        this.MouseSegmentName = n;
    },

    setSelectSegment: function(tier, name, start, duration, isSelected) {
        var id = this.getId(tier, name, start);
        this.MouseSegmentName = id;
        this.uiInfo[id] = isSelected;
        this.resizeSelectArea(start, start + duration);
    },

    resizeSelectArea: function(start, end) {
        this.selectS = start;
        this.selectE = end;
    },

    resizeSelectAreaMulti: function(start, end) {
        if (start < this.selectS)
            this.selectS = start;
        if (end > this.selectE)
            this.selectE = end;
    },

    setSelectMultiSegment: function(tier, name, start, duration, isSelected) {
        var id = this.getId(tier, name, start);
        if (this.uiInfo[id - 1] ||  this.uiInfo[id + 1]) {
            this.uiInfo[id] = isSelected;
            this.resizeSelectAreaMulti(start, start + duration);
            return true;
        } else return false;
    },

    isSelected: function(tier, name, start) {
        if (tier.TierName == this.getSelectTier())
            return this.uiInfo[this.getId(tier, name, start)];
        else
            return false;
    },

    getAllSelected: function(tier) {
        var ret = [];
        var j = 0;
        if (tier.TierName == this.getSelectTier()) {
            for (e in tier.events) {
                if (this.uiInfo[j]) ret[j] = tier.events[e];
                j++;
            }
            return ret;
        } else
            return false;
    },
    

    countSelected: function() {
        var x = 0;
        for (var i = 0; i < this.uiInfo.length; i++)
            if (this.uiInfo[i]) x++;
        return x;
    },


    getCurrentSample: function(perc) {
        return this.sS + (this.eS - this.sS) * perc;
    },

    getId: function(tier, name, start) {
        var j = 0;
        for (var y in tier.events) {
            if (tier.events[y].label == name && tier.events[y].startSample == start)
                return j;
            j++;
        }
        return false;
    },

    resetSelection: function(length) {
        for (var i = 0; i < length; i++) {
            this.uiInfo[i] = false;
        }
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