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
    init: function (sSample, eSample, bufferLength) {

        this.sS = sSample;
        this.eS = eSample;

        this.selectS = 0;
        this.selectE = 0;
        console.log(bufferLength)
        this.bufferLength = bufferLength; // on init

        this.segmentsLoaded = false;
        this.selectedSegments = [];   // [Tiers][Segments]

        this.selTier = -1; // -1 == no segment selected
        this.curMouseTierName = "";
        this.curMouseSegmentID = "";
        this.selBoundaries = [];

        this.selectSPixel = 0;
        this.selectEPixel = 0;

        this.curCursorPosInPercent = 0.5;
    }
};
