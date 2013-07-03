EmuLabeller.ViewPort = {


    init: function (sSample, eSample, bufferLength) {

        this.sS = sSample;
        this.eS = eSample;

        this.selectS = 0;
        this.selectE = 0;

        this.maxLength = bufferLength; // on init

        this.selTier = -1; // -1 == no segment selected
        this.selSegment = -1; // -1 == no segment selected

        this.curMouseTierID = "";
        this.curMouseBoundary = -1;
    }
};
