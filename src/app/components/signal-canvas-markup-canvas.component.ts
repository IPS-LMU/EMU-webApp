import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let SignalCanvasMarkupCanvasComponent = {
    selector: "signalCanvasMarkupCanvas",
    template:  /*html*/`
    <canvas class="emuwebapp-timelineCanvasMarkup" 
    width="4096" 
    ></canvas>
    `,
    bindings: {
        trackName: '<',
        playHeadCurrentSample: '<',
        movingBoundarySample: '<',
        curMouseX: '<',
        curMouseY: '<',
        movingBoundary: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<',
        curBndl: '<'
    },
    controller: [
        '$scope', 
        '$element', 
        'ViewStateService', 
        'ConfigProviderService', 
        'SsffDataService', 
        'DrawHelperService', 
        'HistoryService', 
        'SoundHandlerService',
        class SignalCanvasMarkusCanvasController{
        
        private $scope;
        private $element;
        private ViewStateService;
        private ConfigProviderService;
        private SsffDataService;
        private DrawHelperService;
        private HistoryService;
        private SoundHandlerService;

        private trackName;
        private curMouseX;

        private canvas;
        private ctx;

        private formantCorrectionTrack;

        private curMouseY;
        private drawCrossHairs;

        private _inited = false;
        
        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            ConfigProviderService, 
            SsffDataService, 
            DrawHelperService, 
            HistoryService, 
            SoundHandlerService
            ){
            this.$element = $element;
            this.$scope = $scope;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService;
            this.SsffDataService = SsffDataService;
            this.DrawHelperService = DrawHelperService;
            this.HistoryService = HistoryService;
            this.SoundHandlerService = SoundHandlerService;

            this.drawCrossHairs = false;
    
        }
        $postLink (){
            this.canvas = this.$element.find('canvas')[0];
            this.ctx = this.canvas.getContext('2d');
            
            /////////////////////////////
            // Bindings
            this.$element.bind('mousedown', (event) => {
                if(!event.shiftKey){
                    this.ViewStateService.curViewPort.movingS = Math.round(this.ViewStateService.getX(event) * this.ViewStateService.getSamplesPerPixelVal(event) + this.ViewStateService.curViewPort.sS);
                    this.ViewStateService.curViewPort.movingE = this.ViewStateService.curViewPort.movingS;
                    this.ViewStateService.select(
                        this.ViewStateService.curViewPort.movingS, 
                        this.ViewStateService.curViewPort.movingE);
                    this.drawMarkup();
                    this.$scope.$apply();
                }
            });


            this.$element.bind('mouseup', (event) => {
                if(event.shiftKey){
                    var curSample = Math.round(this.ViewStateService.getX(event) * this.ViewStateService.getSamplesPerPixelVal(event) + this.ViewStateService.curViewPort.sS);
                    var selectDist = this.ViewStateService.curViewPort.selectE - this.ViewStateService.curViewPort.selectS;
                    if(curSample <= this.ViewStateService.curViewPort.selectS + selectDist/2){
                        this.ViewStateService.curViewPort.selectS = curSample;
                    }
                    // expand right
                    if(curSample >= this.ViewStateService.curViewPort.selectE - selectDist/2){
                        this.ViewStateService.curViewPort.selectE = curSample;
                    }
                    this.drawMarkup();
                    this.$scope.$apply();
                }
            });


            this.$element.bind('mousemove', (event) => {
                var mbutton = 0;
                this.drawCrossHairs = true;
                if (event.buttons === undefined) {
                    mbutton = event.which;
                } else {
                    mbutton = event.buttons;
                }
                // perform mouse tracking
                var mouseX = this.ViewStateService.getX(event);
                this.ViewStateService.curMouseX = mouseX;
                this.curMouseY = this.ViewStateService.getY(event);
                this.ViewStateService.curMouseY = this.curMouseY;
                this.ViewStateService.curMouseTrackName = this.trackName;
                this.ViewStateService.curMousePosSample = Math.round(this.ViewStateService.curViewPort.sS + mouseX / this.canvas.width * (this.ViewStateService.curViewPort.eS - this.ViewStateService.curViewPort.sS));

                switch (mbutton) {
                    case 0:
                        if (this.ViewStateService.getPermission('labelAction')) {
                                        // draw crossHairs
                            // if (leave !== false && this.ConfigProviderService.vals.restrictions.drawCrossHairs) {

                            // }
                            if (!$.isEmptyObject(this.SsffDataService.data)) {
                                if (this.SsffDataService.data.length !== 0) {
                                    if (!this.ViewStateService.getdragBarActive()) {
                                        if (this.ViewStateService.curCorrectionToolNr !== undefined && !this.ViewStateService.getdragBarActive() && !$.isEmptyObject(this.ConfigProviderService.getAssignment(this.trackName))) {
                                            if (this.formantCorrectionTrack === undefined) {
                                                this.formantCorrectionTrack = this.ConfigProviderService.getSsffTrackConfig('FORMANTS');
                                            }
                                            var col = this.SsffDataService.getColumnOfTrack(this.formantCorrectionTrack.name, this.formantCorrectionTrack.columnName);
                                            var sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(this.formantCorrectionTrack.name);
                                            var startTimeVP = this.ViewStateService.getViewPortStartTime();
                                            var endTimeVP = this.ViewStateService.getViewPortEndTime();
                                            var colStartSampleNr = Math.round(startTimeVP * sRaSt.sampleRate + sRaSt.startTime);
                                            var colEndSampleNr = Math.round(endTimeVP * sRaSt.sampleRate + sRaSt.startTime);
                                            var nrOfSamples = colEndSampleNr - colStartSampleNr;
                                            var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
                                            var curMouseTime = startTimeVP + (this.ViewStateService.getX(event) / event.originalEvent.target.width) * (endTimeVP - startTimeVP);
                                            var curMouseSample = Math.round((curMouseTime + sRaSt.startTime) * sRaSt.sampleRate) - 1; //-1 for in view correction
                                            if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
                                                //console.log('early return');
                                                return;
                                            }
                                            this.ViewStateService.curPreselColumnSample = curMouseSample - colStartSampleNr;

                                            if (event.shiftKey) {
                                                var oldValue = angular.copy(curSampleArrs[this.ViewStateService.curPreselColumnSample][this.ViewStateService.curCorrectionToolNr - 1]);
                                                var newValue = this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.getY(event) / event.originalEvent.target.height * this.ViewStateService.spectroSettings.rangeTo; // SIC only using rangeTo

                                                curSampleArrs[this.ViewStateService.curPreselColumnSample][this.ViewStateService.curCorrectionToolNr - 1] = this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.getY(event) / event.originalEvent.target.height * this.ViewStateService.spectroSettings.rangeTo;
                                                this.HistoryService.updateCurChangeObj({
                                                    'type': 'SSFF',
                                                    'trackName': this.formantCorrectionTrack.name,
                                                    'sampleBlockIdx': colStartSampleNr + this.ViewStateService.curPreselColumnSample,
                                                    'sampleIdx': this.ViewStateService.curCorrectionToolNr - 1,
                                                    'oldValue': oldValue,
                                                    'newValue': newValue
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case 1:
                        if (!this.ViewStateService.getdragBarActive()) {
                            this.setSelectDrag(event);
                        }
                        break;
                }
                this.$scope.$apply();
            });
            /*
                element.bind('mouseup', function (event) {
                if (!ViewStateService.getdragBarActive()) {
                scope.setSelectDrag(event);
                scope.drawMarkup(event, false);
                }
                });
                */
            // on mouse leave clear markup canvas
            this.$element.bind('mouseleave', (event) => {
                this.drawCrossHairs = false;
                if (!$.isEmptyObject(this.SoundHandlerService)) {
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        if (!this.ViewStateService.getdragBarActive()) {
                            if (this.ViewStateService.getPermission('labelAction')) {
                                this.drawMarkup();
                                this.ViewStateService.curMouseTrackName = undefined;
                            }
                        }
                    }
                }
            });
            
        };
        
        $onChanges (changes) {
            if(this._inited){
                //
                if(changes.curBndl){
                    if (!$.isEmptyObject(this.SsffDataService.data)) {
                        if (this.SsffDataService.data.length !== 0) {
                            this.formantCorrectionTrack = this.ConfigProviderService.getSsffTrackConfig('FORMANTS');
                        }
                    }
                }
                // 
                if(changes.playHeadCurrentSample){
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        this.drawPlayHead();
                    }
                }
                //
                if(changes.movingBoundarySample || changes.curMouseX || changes.curMouseY || changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.viewPortSelectStart || changes.viewPortSelectEnd){
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        this.drawMarkup();
                    }
                }
                
            }
        }

        $onInit () {
            this._inited = true;
        };

        private drawMarkup () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // draw current viewport selected
            var minVal = 0;
            var maxVal = 0;
            var unit = '';
            if (this.trackName === 'OSCI') {
                this.DrawHelperService.drawViewPortTimes(this.ctx, true);
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, true);
            } else if (this.trackName === 'SPEC') {
                minVal = this.ViewStateService.spectroSettings.rangeFrom;
                maxVal = this.ViewStateService.spectroSettings.rangeTo;
                unit = 'Hz';
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                this.DrawHelperService.drawMinMaxAndName(
                    this.ctx, 
                    '', 
                    minVal, 
                    maxVal, 
                    2);
            } else {
                var tr = this.ConfigProviderService.getSsffTrackConfig(this.trackName);
                var minMaxValLims = this.ConfigProviderService.getValueLimsOfTrack(this.trackName); 
                if(!angular.equals(minMaxValLims, {})){
                    minVal = minMaxValLims.minVal;
                    maxVal = minMaxValLims.maxVal;
                    if(minMaxValLims.unit !== undefined){
                        unit = minMaxValLims.unit;
                    }
                } else {
                    var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                    if(typeof col !== "undefined"){
                        minVal = col._minVal;
                        maxVal = col._maxVal;
                    }
                }
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                if(maxVal > 0){
                    this.DrawHelperService.drawMinMaxAndName(
                        this.ctx, 
                        this.trackName, 
                        minVal, 
                        maxVal, 
                        2);
                }
            }
            if(this.drawCrossHairs){
                this.DrawHelperService.drawCrossHairs(
                    this.ctx, 
                    this.curMouseX,
                    this.curMouseY, 
                    minVal, 
                    maxVal, 
                    unit, 
                    this.trackName);
            } else {
                this.DrawHelperService.drawCrossHairX(this.ctx, this.curMouseX);
            }
            if (this.formantCorrectionTrack) {
                // While a formant is being corrected, highlight both the new and the old value

                let curChangeObj = this.HistoryService.curChangeObj;
                let sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(this.formantCorrectionTrack.name);

                for (let key in curChangeObj) {
                    let currentSampleTime = (1 / sRaSt.sampleRate * curChangeObj[key].sampleBlockIdx) + sRaSt.startTime;
                    let x =
                        (currentSampleTime - this.ViewStateService.getViewPortStartTime())
                        / (this.ViewStateService.getViewPortEndTime() - this.ViewStateService.getViewPortStartTime())
                        * this.canvas.width;
                    let yNew =
                        this.canvas.height
                        - curChangeObj[key].newValue
                        / (this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.spectroSettings.rangeFrom)
                        * this.canvas.height;
                    let yOld =
                        this.canvas.height
                        - curChangeObj[key].oldValue
                        / (this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.spectroSettings.rangeFrom)
                        * this.canvas.height;

                    // draw new value
                    this.ctx.strokeStyle = 'black';
                    this.ctx.fillStyle = 'black';
                    this.ctx.beginPath();
                    this.ctx.arc(x, yNew - 1, 2, 0, 2 * Math.PI, false);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    this.ctx.fill();

                    // draw old value
                    this.ctx.strokeStyle = 'red';
                    this.ctx.fillStyle = 'red';
                    this.ctx.beginPath();
                    this.ctx.arc(x, yOld - 1, 2, 0, 2 * Math.PI, false);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    this.ctx.fill();
                }
            }

            // draw moving boundary line if moving
            this.DrawHelperService.drawMovingBoundaryLine(this.ctx);
        };

        private setSelectDrag (event) {
            let curMouseSample = Math.round(this.ViewStateService.getX(event) * this.ViewStateService.getSamplesPerPixelVal(event) + this.ViewStateService.curViewPort.sS);
            if (curMouseSample > this.ViewStateService.curViewPort.movingS) {
                this.ViewStateService.curViewPort.movingE = curMouseSample;
            } else {
                this.ViewStateService.curViewPort.movingS = curMouseSample;
            }
            this.ViewStateService.select(this.ViewStateService.curViewPort.movingS, this.ViewStateService.curViewPort.movingE);
            this.$scope.$apply();
        };
      /**
        *
        */
       private drawPlayHead () {
        this.drawMarkup();
        var posS = this.ViewStateService.getPos(this.canvas.width, this.ViewStateService.playHeadAnimationInfos.sS);
        var posCur = this.ViewStateService.getPos(this.canvas.width, this.ViewStateService.playHeadAnimationInfos.curS);
        this.ctx.fillStyle = styles.colorTransparentLightGrey;
        this.ctx.fillRect(posS, 0, posCur - posS, this.canvas.height);
    };
    }]
}

angular.module('emuwebApp')
.component(SignalCanvasMarkupCanvasComponent.selector, SignalCanvasMarkupCanvasComponent);
