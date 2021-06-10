import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let SsffCanvasComponent = {
    selector: "ssffCanvas",
    template:  /*html*/`
    <canvas 
    class="emuwebapp-timelineCanvasSSFF" 
    width="4096"
    ></canvas>
    `,
    bindings: {
        trackName: '<',
        allSsffData: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        curBndl: '<',
        curMouseX: '<',
        curMouseY: '<'
    },
    controller: [
        '$scope', 
        '$element', 
        'ViewStateService', 
        'ConfigProviderService', 
        'SsffDataService', 
        'HistoryService',
        'FontScaleService', 
        'LoadedMetaDataService',
        class SsffCanvasController{
        private $scope;
        private $element;
        private ViewStateService;
        private ConfigProviderService;
        private SsffDataService;
        private HistoryService;
        private FontScaleService;
        private LoadedMetaDataService;
        
        private assignmentTrackName = '';
        private canvas;
        private ctx;
        private trackName;
        private allSsffData;
        private _inited = false;

        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            ConfigProviderService, 
            SsffDataService, 
            HistoryService,
            FontScaleService, 
            LoadedMetaDataService
            ){
            this.$scope = $scope;
            this.$element = $element;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService;
            this.SsffDataService = SsffDataService;
            this.HistoryService = HistoryService;
            this.FontScaleService = FontScaleService;
            this.LoadedMetaDataService = LoadedMetaDataService;
    
        }
        $postLink (){
            this.canvas = this.$element.find('canvas')[0];
            this.ctx = this.canvas.getContext('2d');
        }
        $onChanges (changes) {
            if(this._inited){
                if(changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.curBndl || changes.allSsffData){
                    this.handleUpdate();
                }
                if(changes.curMouseX || changes.curMouseY){
                    this.handleUpdate();
                }
            }
        }
        $onInit () {
            this._inited = true;
        };
        /**
        *
        */
        private handleUpdate () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (!$.isEmptyObject(this.allSsffData)) {
                if (this.allSsffData.length !== 0) {
                    this.assignmentTrackName = '';
                    // check assignments (= overlays)
                    this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].signalCanvases.assign.forEach((assignment) => {
                        if (assignment.signalCanvasName === this.trackName) {
                            this.assignmentTrackName = assignment.ssffTrackName;
                            var tr = this.ConfigProviderService.getSsffTrackConfig(assignment.ssffTrackName);
                            var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                            var sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
                            var minMaxCountourLims = this.ConfigProviderService.getContourLimsOfTrack(tr.name);
                            var minMaxValLims = this.ConfigProviderService.getValueLimsOfTrack(tr.name);
                            // draw values
                            this.drawValues(this.ViewStateService, this.ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxCountourLims, minMaxValLims);
                        }
                    });
                    this.assignmentTrackName = '';
                    // draw ssffTrack onto own canvas
                    if (this.trackName !== 'OSCI' && this.trackName !== 'SPEC') {
                        
                        var tr = this.ConfigProviderService.getSsffTrackConfig(this.trackName);
                        var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                        var sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
                        
                        var minMaxContourLims = this.ConfigProviderService.getContourLimsOfTrack(tr.name);
                        var minMaxValLims = this.ConfigProviderService.getValueLimsOfTrack(tr.name);
                        //console.log(minMaxValLims);
                        // draw values
                        this.drawValues(this.ViewStateService, this.ConfigProviderService, col, sRaSt.sampleRate, sRaSt.startTime, minMaxContourLims, minMaxValLims);
                    }
                }
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
        
        /**
        * draw values onto canvas
        */
        private drawValues (ViewStateService, config, col, sR, sT, minMaxContourLims, minMaxValLims) {
            
            var minVal, maxVal;
            
            if (this.trackName === 'SPEC' && this.assignmentTrackName === 'FORMANTS') {
                minVal = ViewStateService.spectroSettings.rangeFrom;
                maxVal = ViewStateService.spectroSettings.rangeTo;
            } else {
                minVal = col._minVal;
                maxVal = col._maxVal;
            }
            // if minMaxValLims are set use those instead
            if(!angular.equals(minMaxValLims, {})){
                minVal = minMaxValLims.minVal;
                maxVal = minMaxValLims.maxVal;
            }
            
            var startTimeVP = ViewStateService.getViewPortStartTime();
            var endTimeVP = ViewStateService.getViewPortEndTime();
            var colStartSampleNr = Math.round(startTimeVP * sR + sT);
            var colEndSampleNr = Math.round(endTimeVP * sR + sT);
            var nrOfSamples = colEndSampleNr - colStartSampleNr;
            var curSampleArrs = col.values.slice(colStartSampleNr, colStartSampleNr + nrOfSamples);
            
            // draw horizontal lines
            var horizontalLines = this.ConfigProviderService.getHorizontalLinesOfTrack(this.trackName);
            if (horizontalLines) {
                // loop through array of yVals and draw blue line in canvas
                horizontalLines.yValues.forEach((yVal) => {
                    this.ctx.beginPath();
                    this.ctx.lineWidth = "2";
                    this.ctx.strokeStyle = "blue";
                    this.ctx.globalAlpha = 0.75;
                    var zeroY = this.canvas.height - ((yVal - minVal) / (maxVal - minVal) * this.canvas.height);
                    this.ctx.moveTo(0, zeroY);
                    this.ctx.lineTo(this.canvas.width, zeroY);
                    this.ctx.stroke();
                    this.ctx.lineWidth = "1";
                    this.ctx.globalAlpha = 1;
                });
                
            }
            
            if (nrOfSamples < this.canvas.width && nrOfSamples >= 2) {
                
                var x, y, curSampleInCol, curSampleInColTime;
                
                ////////////////////////////////
                // NEW VERSION
                ////////////////////////////////
                
                curSampleArrs[0].forEach((contourVal, contourNr) => {
                    
                    // console.log(contourNr);
                    if ($.isEmptyObject(minMaxContourLims) || (contourNr >= minMaxContourLims.minContourIdx && contourNr <= minMaxContourLims.maxContourIdx)) {
                        
                        // set color
                        if ($.isEmptyObject(minMaxContourLims)) {
                            this.ctx.strokeStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                            this.ctx.fillStyle = 'hsl(' + contourNr * (360 / curSampleArrs[0].length) + ',80%, 50%)';
                        } else {
                            var l = (minMaxContourLims.maxContourIdx - minMaxContourLims.minContourIdx) + 1;
                            this.ctx.strokeStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                            this.ctx.fillStyle = 'hsl(' + contourNr * (360 / l) + ',80%, 50%)';
                        }
                        
                        // overwrite color settings if they are preconfigured
                        if(this.assignmentTrackName !== ''){
                            var contColors = this.ConfigProviderService.getContourColorsOfTrack(this.assignmentTrackName);
                        } else {
                            var contColors = this.ConfigProviderService.getContourColorsOfTrack(this.trackName);
                        }
                        if (contColors !== undefined) {
                            if (contColors.colors[contourNr] !== undefined) {
                                this.ctx.strokeStyle = this.ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
                                this.ctx.fillStyle = this.ConfigProviderService.vals.perspectives[ViewStateService.curPerspectiveIdx].signalCanvases.contourColors[0].colors[contourNr];
                            }
                        }
                        
                        // mark selected
                        // console.log(ViewStateService.curCorrectionToolNr);
                        if (ViewStateService.curCorrectionToolNr - 1 === contourNr && this.trackName === 'SPEC' && this.assignmentTrackName === 'FORMANTS') {
                            this.ctx.strokeStyle = styles.colorGreen;
                            this.ctx.fillStyle = styles.colorGreen;
                        }
                        
                        this.ctx.beginPath();
                        // first line from sample not in view (left)
                        if (colStartSampleNr >= 1) {
                            var leftBorder = col.values[colStartSampleNr - 1];
                            var leftVal = leftBorder[contourNr];
                            
                            curSampleInCol = colStartSampleNr - 1;
                            curSampleInColTime = (1 / sR * curSampleInCol) + sT;
                            
                            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * this.canvas.width;
                            y = this.canvas.height - ((leftVal - minVal) / (maxVal - minVal) * this.canvas.height);
                            
                            this.ctx.moveTo(x, y);
                        }
                        
                        curSampleArrs.forEach((curArr, curArrIdx) => {
                            // console.log(curArr[contourNr]);
                            
                            curSampleInCol = colStartSampleNr + curArrIdx;
                            curSampleInColTime = (1 / sR * curSampleInCol) + sT;
                            
                            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * this.canvas.width;
                            y = this.canvas.height - ((curArr[contourNr] - minVal) / (maxVal - minVal) * this.canvas.height);
                            
                            this.ctx.arc(x, y - 1, 2, 0, 2 * Math.PI, false);
                            this.ctx.lineTo(x, y);
                            
                        });
                        // last line from sample not in view (right)
                        if (colEndSampleNr < col.values.length - 1) {
                            var rightBorder = col.values[colEndSampleNr + 1];
                            var rightVal = rightBorder[contourNr];
                            
                            curSampleInCol = colEndSampleNr + 1;
                            curSampleInColTime = (1 / sR * curSampleInCol) + sT;
                            
                            x = (curSampleInColTime - startTimeVP) / (endTimeVP - startTimeVP) * this.canvas.width;
                            y = this.canvas.height - ((rightVal - minVal) / (maxVal - minVal) * this.canvas.height);
                            
                            this.ctx.lineTo(x, y);
                        }
                        
                        this.ctx.stroke();
                        // ctx.fill();
                    }
                });
            } else {
                this.ctx.strokeStyle = 'red';
                if (nrOfSamples <= 2) {
                    this.FontScaleService.drawUndistortedTextTwoLines(this.ctx, 'Zoom out to', 'see contour(s)', parseInt(styles.fontSmallSize.slice(0, -2)) / 1.05, styles.fontSmallFamily, this.canvas.width / 2 - (this.ctx.measureText('see contour(s)').width * this.ctx.canvas.width / this.ctx.canvas.offsetWidth / 2), 25, styles.colorTransparentRed);
                } else {
                    this.FontScaleService.drawUndistortedTextTwoLines(this.ctx, 'Zoom in to', 'see contour(s)', parseInt(styles.fontSmallSize.slice(0, -2)) / 1.05, styles.fontSmallFamily, this.canvas.width / 2 - (this.ctx.measureText('see contour(s)').width * this.ctx.canvas.width / this.ctx.canvas.offsetWidth / 2), 25, styles.colorTransparentRed);
                }
            }
        } //function
    }]
}

angular.module('emuwebApp')
.component(SsffCanvasComponent.selector, SsffCanvasComponent);