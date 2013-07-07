EmuLabeller.ViewPort = {


    init: function (sSample, eSample, bufferLength) {

        this.sS = sSample;
        this.eS = eSample;

        this.selectS = 0;
        this.selectE = 0;

        this.maxLength = bufferLength; // on init

        this.segmentsLoaded = false;
        this.selectedSegments = [];   // [Tiers][Segments]

        this.selTier = -1; // -1 == no segment selected
        
        this.selSegment = -1; // -1 == no segment selected

        this.curMouseTierName = "";
        this.curMouseSegmentID = "";
        this.selBoundaries = [];

        this.selectSPixel = 0;
        this.selectEPixel = 0;
    }
};
