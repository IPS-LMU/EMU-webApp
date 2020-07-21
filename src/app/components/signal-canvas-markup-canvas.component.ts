import * as angular from 'angular';

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
    controller: class SignalCanvasMarkusCanvasController{
        
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

        private tr; 
        private col; 
        private sRaSt;

        private curMouseY;
        private drawCrossHairs;

        private _inited = false;
        
        constructor($scope, $element, ViewStateService, ConfigProviderService, SsffDataService, DrawHelperService, HistoryService, SoundHandlerService){
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
        $postLink = function(){
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
                    this.drawMarkup(event);
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
                    this.drawMarkup(event);
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
                                            // var col = SsffDataService.data[0].Columns[0];
                                            if (this.tr === undefined) {
                                                this.tr = this.ConfigProviderService.getSsffTrackConfig('FORMANTS');
                                            }
                                            this.col = this.SsffDataService.getColumnOfTrack(this.tr.name, this.tr.columnName);
                                            this.sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(this.tr.name);
                                            var startTimeVP = this.ViewStateService.getViewPortStartTime();
                                            var endTimeVP = this.ViewStateService.getViewPortEndTime();
                                            var colStartSampleNr = Math.round(startTimeVP * this.sRaSt.sampleRate + this.sRaSt.startTime);
                                            var colEndSampleNr = Math.round(endTimeVP * this.sRaSt.sampleRate + this.sRaSt.startTime);
                                            var nrOfSamples = colEndSampleNr - colStartSampleNr;
                                            var curSampleArrs = this.col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
                                            var curMouseTime = startTimeVP + (this.ViewStateService.getX(event) / event.originalEvent.target.width) * (endTimeVP - startTimeVP);
                                            var curMouseSample = Math.round((curMouseTime + this.sRaSt.startTime) * this.sRaSt.sampleRate) - 1; //-1 for in view correction
                                            var curMouseSampleTime = (1 / this.sRaSt.sampleRate * curMouseSample) + this.sRaSt.startTime;
                                            if (curMouseSample - colStartSampleNr < 0 || curMouseSample - colStartSampleNr >= curSampleArrs.length) {
                                                //console.log('early return');
                                                return;
                                            }
                                            this.ViewStateService.curPreselColumnSample = curMouseSample - colStartSampleNr;
                                            var x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * this.canvas.width;
                                            var y = this.canvas.height - curSampleArrs[this.ViewStateService.curPreselColumnSample][this.ViewStateService.curCorrectionToolNr - 1] / (this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.spectroSettings.rangeFrom) * this.canvas.height;

                                            // draw sample
                                            this.ctx.strokeStyle = 'black';
                                            this.ctx.fillStyle = 'black';
                                            this.ctx.beginPath();
                                            this.ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                                            this.ctx.closePath();
                                            this.ctx.stroke();
                                            this.ctx.fill();


                                            if (event.shiftKey) {
                                                var oldValue = angular.copy(curSampleArrs[this.ViewStateService.curPreselColumnSample][this.ViewStateService.curCorrectionToolNr - 1]);
                                                var newValue = this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.getY(event) / event.originalEvent.target.height * this.ViewStateService.spectroSettings.rangeTo; // SIC only using rangeTo

                                                curSampleArrs[this.ViewStateService.curPreselColumnSample][this.ViewStateService.curCorrectionToolNr - 1] = this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.getY(event) / event.originalEvent.target.height * this.ViewStateService.spectroSettings.rangeTo;
                                                var updateObj = this.HistoryService.updateCurChangeObj({
                                                    'type': 'SSFF',
                                                    'trackName': this.tr.name,
                                                    'sampleBlockIdx': colStartSampleNr + this.ViewStateService.curPreselColumnSample,
                                                    'sampleIdx': this.ViewStateService.curCorrectionToolNr - 1,
                                                    'oldValue': oldValue,
                                                    'newValue': newValue
                                                });

                                                //draw updateObj as overlay
                                                for (var key in updateObj) {
                                                    curMouseSampleTime = (1 / this.sRaSt.sampleRate * updateObj[key].sampleBlockIdx) + this.sRaSt.startTime;
                                                    x = (curMouseSampleTime - startTimeVP) / (endTimeVP - startTimeVP) * this.canvas.width;
                                                    y = this.canvas.height - updateObj[key].newValue / (this.ViewStateService.spectroSettings.rangeTo - this.ViewStateService.spectroSettings.rangeFrom) * this.canvas.height;

                                                    // draw sample
                                                    this.ctx.strokeStyle = 'red';
                                                    this.ctx.fillStyle = 'red';
                                                    // this.ctx.lineWidth = 4;
                                                    this.ctx.beginPath();
                                                    this.ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                                                    this.ctx.closePath();
                                                    this.ctx.stroke();
                                                    this.ctx.fill();
                                                }
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
                                this.drawMarkup(event, false);
                                this.ViewStateService.curMouseTrackName = undefined;
                            }
                        }
                    }
                }
            });
            
        };
        
        $onChanges = function (changes) {
            if(this._inited){
                //
                if(changes.curBndl){
                    if (!$.isEmptyObject(this.SsffDataService.data)) {
                        if (this.SsffDataService.data.length !== 0) {
                            this.tr = this.ConfigProviderService.getSsffTrackConfig('FORMANTS');
                            if (this.tr !== undefined) {
                                this.col = this.SsffDataService.getColumnOfTrack(this.tr.name, this.tr.columnName);
                                this.sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(this.tr.name);
                            }
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

        $onInit = function() {
            this._inited = true;
        };

        private drawMarkup(event, leave) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // draw current viewport selected
            if (this.trackName === 'OSCI') {
                this.DrawHelperService.drawViewPortTimes(this.ctx, true);
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, true);
            } else if (this.trackName === 'SPEC') {
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                this.DrawHelperService.drawMinMaxAndName(
                    this.ctx, 
                    '', 
                    this.ViewStateService.spectroSettings.rangeFrom, 
                    this.ViewStateService.spectroSettings.rangeTo, 
                    2);
            } else {
                var tr = this.ConfigProviderService.getSsffTrackConfig(this.trackName);
                var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                if(typeof col !== "undefined"){
                    this.DrawHelperService.drawMinMaxAndName(
                        this.ctx, 
                        this.trackName, 
                        col._minVal, 
                        col._maxVal, 
                        2);
                }
            }
            if(this.drawCrossHairs){
                this.DrawHelperService.drawCrossHairs(
                    this.ctx, 
                    this.curMouseX,
                    this.curMouseY, 
                    this.ViewStateService.spectroSettings.rangeFrom, 
                    this.ViewStateService.spectroSettings.rangeTo, 
                    'Hz', 
                    this.trackName);
            } else {
                this.DrawHelperService.drawCrossHairX(this.ctx, this.curMouseX);
            }

            // draw moving boundary line if moving
            this.DrawHelperService.drawMovingBoundaryLine(this.ctx);
        };

        private setSelectDrag = function (event) {
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
       private drawPlayHead = function () {
        this.drawMarkup();
        var posS = this.ViewStateService.getPos(this.canvas.width, this.ViewStateService.playHeadAnimationInfos.sS);
        var posCur = this.ViewStateService.getPos(this.canvas.width, this.ViewStateService.playHeadAnimationInfos.curS);
        this.ctx.fillStyle = this.ConfigProviderService.design.color.transparent.lightGrey;
        this.ctx.fillRect(posS, 0, posCur - posS, this.canvas.height);
    };
    }
}

angular.module('emuwebApp')
.component(SignalCanvasMarkupCanvasComponent.selector, SignalCanvasMarkupCanvasComponent);