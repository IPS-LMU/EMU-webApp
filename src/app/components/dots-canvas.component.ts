import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let DotsCanvasComponent = {
    selector: "dotsCanvas",
    template: /*html*/`
    <div class="emuwebapp-twoDimCanvasContainer">
    <canvas class="emuwebapp-twoDimCanvasStatic" width="512" height="512">
    </canvas>
    <canvas class="emuwebapp-twoDimCanvasDots" width="512" height="512">
    </canvas>
    </div>
    `,
    bindings: {
        curBndl: '<',
        curPerspectiveIdx: '<',
        curMousePosSample: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<'
    },
    controller: [
        '$scope', 
        '$element', 
        'ViewStateService', 
        'ConfigProviderService', 
        'SoundHandlerService', 
        'SsffDataService', 
        'FontScaleService', 
        'MathHelperService',
        class DotsCanvasController {
        private $scope;
        private $element;
        private ViewStateService;
        private ConfigProviderService
        private SoundHandlerService;
        private SsffDataService;
        private FontScaleService;
        private MathHelperService;

        private canvas;
        private staticContoursCanvas;

        private globalMinX;
        private globalMaxX;
        private globalMinY;
        private globalMaxY;
        private startPoint;
        private endPoint;

        private _inited; 

        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            ConfigProviderService, 
            SoundHandlerService, 
            SsffDataService, 
            FontScaleService, 
            MathHelperService
            ){
            this.$scope = $scope;
            this.$element = $element;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService
            this.SoundHandlerService = SoundHandlerService;
            this.SsffDataService = SsffDataService;
            this.FontScaleService = FontScaleService;
            this.MathHelperService = MathHelperService;

            this.resetValues();

            this._inited = false;


        };

        $postLink = function() {
            this.canvas = this.$element.find('canvas')[1];
            this.staticContoursCanvas = this.$element.find('canvas')[0];
        };
        
        $onChanges = function (changes) {
            //
            if(this._inited){
                // reset values so that these are recalculated on redraw
                if(changes.curBndl || changes.curPerspectiveIdx){
                    this.resetValues();
                }
                this.drawDots();
            }
            
        };
        

        $onInit = function() {
            this._inited = true;
        };

        private resetValues (): void {
            this.globalMinX = Infinity;
            this.globalMaxX = -Infinity;
            this.globalMinY = Infinity;
            this.globalMaxY = -Infinity;
            this.startPoint = 0;
            this.endPoint = (Math.PI / 180) * 360;
        }

        private setGlobalMinMaxVals (): number {
            var dD = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0]; // SIC SIC SIC hardcoded
            for (var i = 0; i < dD.dots.length; i++) {
                // get xCol
                var trConf = this.ConfigProviderService.getSsffTrackConfig(dD.dots[i].xSsffTrack);
                var xCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
                if (typeof xCol === 'undefined'){
                    return(1)
                }
                if (xCol._minVal < this.globalMinX) {
                    this.globalMinX = xCol._minVal;
                }
                if (xCol._maxVal > this.globalMaxX) {
                    this.globalMaxX = xCol._maxVal;
                }

                // get yCol
                trConf = this.ConfigProviderService.getSsffTrackConfig(dD.dots[i].ySsffTrack);
                var yCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
                if (yCol._minVal < this.globalMinY) {
                    this.globalMinY = yCol._minVal;
                }
                if (yCol._maxVal > this.globalMaxY) {
                    this.globalMaxY = yCol._maxVal;
                }
            }

            // also check staticDots
            if(typeof dD.staticDots !== 'undefined'){
                dD.staticDots.forEach((sD) => {
                    sD.xCoordinates.forEach((xVal, xIdx) => {
                        // check x
                        if (xVal < this.globalMinX) {
                            this.globalMinX = xVal;
                        }
                        if (xVal > this.globalMaxX) {
                            this.globalMaxX = xVal;
                        }
                        // check y
                        if (sD.yCoordinates[xIdx] < this.globalMinY) {
                            this.globalMinY = sD.yCoordinates[xIdx];
                        }
                        if (sD.yCoordinates[xIdx] > this.globalMaxY) {
                            this.globalMaxY = sD.yCoordinates[xIdx];
                        }
                    });
                });
            }

            // and staticContours
            if(typeof dD.staticContours !== 'undefined'){
                dD.staticContours.forEach((sC) => {
                    // get xCol
                    var trConf = this.ConfigProviderService.getSsffTrackConfig(sC.xSsffTrack);
                    var xCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
                    if (xCol._minVal < this.globalMinX) {
                        this.globalMinX = xCol._minVal;
                    }
                    if (xCol._maxVal > this.globalMaxX) {
                        this.globalMaxX = xCol._maxVal;
                    }

                    // get yCol
                    trConf = this.ConfigProviderService.getSsffTrackConfig(sC.ySsffTrack);
                    var yCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);
                    if (yCol._minVal < this.globalMinY) {
                        this.globalMinY = yCol._minVal;
                    }
                    if (yCol._maxVal > this.globalMaxY) {
                        this.globalMaxY = yCol._maxVal;
                    }
                });
            }
            return(0)
        };

        /**
         * drawing to draw overlay1 i.e. static
         */
        private drawStaticContour () {
            var ctx = this.staticContoursCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.staticContoursCanvas.width, this.staticContoursCanvas.height);

            var dD = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0];

            for (var i = 0; i < dD.staticContours.length; i++) {
                // get xCol
                var trConf = this.ConfigProviderService.getSsffTrackConfig(dD.staticContours[i].xSsffTrack);
                var xCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);

                // get yCol
                trConf = this.ConfigProviderService.getSsffTrackConfig(dD.staticContours[i].ySsffTrack);
                var yCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);

                var xPrev = undefined;
                var yPrev = undefined;
                for (var j = 0; j < xCol.values.length; j++) {

                    var xsRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.staticContours[i].xSsffTrack);
                    var ysRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.staticContours[i].ySsffTrack);

                    //check if sampleRate and startTime is the same
                    if (xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample) {
                        alert('xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample'); // SIC should never get here!
                        return;
                    }

                    var x = ((xCol.values[j][dD.staticContours[i].xContourNr] - this.globalMinX) / (this.globalMaxX - this.globalMinX) * this.staticContoursCanvas.width);
                    var y = this.staticContoursCanvas.height - ((yCol.values[j][dD.staticContours[i].yContourNr] - this.globalMinY) / (this.globalMaxY - this.globalMinY) * this.staticContoursCanvas.height);

                    ctx.strokeStyle = dD.staticContours[i].color;
                    ctx.fillStyle = dD.staticContours[i].color;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, this.startPoint, this.endPoint, true);
                    ctx.fill();
                    //ctx.closePath();

                    // draw lines
                    if (j >= 1 && dD.staticContours[i].connect) {
                        ctx.beginPath();
                        ctx.moveTo(xPrev, yPrev);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                    }

                    xPrev = x;
                    yPrev = y;

                }
            }
        };

        /**
         * drawing method to drawDots
         */
        private drawDots (): number {
            if (this.globalMinX === Infinity) {
                let returnCode = this.setGlobalMinMaxVals();
                if(returnCode !== 0){
                    return(1);
                }

                if (this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0].staticContours !== undefined) {
                    this.drawStaticContour();
                }
            }

            var ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


            //////////////////////////////
            // markup to improve visualization

            var scaleX = ctx.canvas.width / ctx.canvas.offsetWidth;
            var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

            // draw corner pointers
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(5, 5);
            ctx.moveTo(0, this.canvas.height);
            ctx.lineTo(5, this.canvas.height - 5);
            ctx.moveTo(this.canvas.width, this.canvas.height);
            ctx.lineTo(this.canvas.width - 5, this.canvas.height - 5);
            ctx.stroke();
            ctx.closePath();

            var smallFontSize = parseInt(styles.fontInputSize.slice(0, -2)) * 3 / 4;
            // ymax
            this.FontScaleService.drawUndistortedText(ctx, 'yMax: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(this.globalMaxY, 2), smallFontSize, styles.fontInputFamily, 5, 5, styles.colorWhite, true);
            // xmin + y min
            this.FontScaleService.drawUndistortedTextTwoLines(ctx, 'yMin: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(this.globalMinY, 2), 'xMin: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(this.globalMinX, 2), smallFontSize, styles.fontInputFamily, 5, this.canvas.height - smallFontSize * scaleY * 2 - 5, styles.colorWhite, true);
            // xmax
            var tw = ctx.measureText('xMax: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(this.globalMaxX, 5)).width * scaleX; // SIC why 5???
            this.FontScaleService.drawUndistortedText(ctx, 'xMax: ' + this.MathHelperService.roundToNdigitsAfterDecPoint(this.globalMaxX, 2), smallFontSize, styles.fontInputFamily, this.canvas.width - tw - 5, this.canvas.height - smallFontSize * scaleY - 5, styles.colorWhite, true);

            var dD = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions[0]; // SIC SIC SIC hardcoded

            // frame nr
            var xsRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.dots[0].xSsffTrack); // use first track for sample numbers
            var ysRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.dots[0].ySsffTrack);
            
            if(typeof(xsRaSt) === 'undefined' || typeof(ysRaSt) === 'undefined'){
                return(1)
            }

            //var sInterv = (1 / xsRaSt.sampleRate);
            var curMousePosTime = this.ViewStateService.curMousePosSample / this.SoundHandlerService.audioBuffer.sampleRate;
            var curFrame;

            if (xsRaSt.startTime === (1 / xsRaSt.sampleRate) / 2) {
                curFrame = Math.round(curMousePosTime * xsRaSt.sampleRate);
            } else {
                curFrame = Math.round((curMousePosTime * xsRaSt.sampleRate) + ((xsRaSt.startTime - (1 / xsRaSt.sampleRate) / 2) * xsRaSt.sampleRate));
            }
            // check if due to math.round curFrame > col.length
            var trConf = this.ConfigProviderService.getSsffTrackConfig(dD.dots[0].xSsffTrack);
            var xCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);

            if (curFrame > xCol.values.length - 1) {
                curFrame = xCol.values.length - 1;
            }

            tw = ctx.measureText('frame: ' + curFrame).width * scaleX;
            var degrees = 90;
            ctx.save();
            ctx.rotate(degrees * Math.PI / 180);
            this.FontScaleService.drawUndistortedText(ctx, 'frame: ' + curFrame, parseInt(styles.fontInputSize.slice(0, -2)) - 4, styles.fontInputFamily, this.canvas.width / 2 - tw / 2, -this.canvas.height, styles.colorWhite, true);
            ctx.restore();

            //////////////////////////////
            // draw dots

            var startPoint = 0; // really don't get why the globals and visable here???
            var endPoint = (Math.PI / 180) * 360;

            var allDots = [];

            for (var i = 0; i < dD.dots.length; i++) {

                // get xCol
                trConf = this.ConfigProviderService.getSsffTrackConfig(dD.dots[i].xSsffTrack);
                xCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);

                // get yCol
                trConf = this.ConfigProviderService.getSsffTrackConfig(dD.dots[i].ySsffTrack);
                var yCol = this.SsffDataService.getColumnOfTrack(trConf.name, trConf.columnName);

                // check if x and why have the same amount of cols
                if (xCol.values.length !== yCol.values.length) {
                    alert('columns do not have same length or length of one not 1');
                    return;
                }

                xsRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.dots[i].xSsffTrack);
                ysRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(dD.dots[i].ySsffTrack);

                // check if sampleRate and startTime is the same
                if (xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample) {
                    alert('xsRaSt.sampleRate !== ysRaSt.sampleRate || xsRaSt.startSample !== ysRaSt.startSample');
                    return;
                }


                var x = ((xCol.values[curFrame][dD.dots[i].xContourNr] - this.globalMinX) / (this.globalMaxX - this.globalMinX) * this.canvas.width);
                var y = this.canvas.height - ((yCol.values[curFrame][dD.dots[i].yContourNr] - this.globalMinY) / (this.globalMaxY - this.globalMinY) * this.canvas.height);

                ctx.strokeStyle = dD.dots[i].color;
                ctx.beginPath();
                ctx.arc(x, y, 20, startPoint, endPoint, true);
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(x, y, 2, startPoint, endPoint, true);
                ctx.fill();
                ctx.closePath();

                // draw labels
                this.FontScaleService.drawUndistortedText(ctx, dD.dots[i].name, parseInt(styles.fontInputSize.slice(0, -2)) - 4, styles.fontInputFamily, x, y - 5, styles.colorWhite, true);

                // append to all dots
                allDots.push({
                    'name': dD.dots[i].name,
                    'x': x,
                    'y': y
                });

            }
            //////////////////////////
            // draw connect lines
            var f, t;
            dD.connectLines.forEach((c) => {
                allDots.forEach((d) => {
                    if (d.name === c.fromDot) {
                        f = d;
                    }
                    if (d.name === c.toDot) {
                        t = d;
                    }
                });

                // draw line
                ctx.strokeStyle = c.color;
                ctx.beginPath();
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(t.x, t.y);
                ctx.stroke();
                ctx.closePath();
            });

            //////////////////////////
            // draw static dots
            startPoint = 0;
            endPoint = (Math.PI / 180) * 360;

            dD.staticDots.forEach((sD) => {
                ctx.strokeStyle = sD.color;
                ctx.fillStyle = sD.color;
                // draw name
                var labelX = ((sD.xNameCoordinate - this.globalMinX) / (this.globalMaxX - this.globalMinX) * this.canvas.width);
                var labelY = this.canvas.height - ((sD.yNameCoordinate - this.globalMinY) / (this.globalMaxY - this.globalMinY) * this.canvas.height);

                this.FontScaleService.drawUndistortedText(ctx, sD.name, parseInt(styles.fontInputSize.slice(0, -2)) - 4, styles.fontInputFamily, labelX, labelY, sD.color, true);

                sD.xCoordinates.forEach((xVal, xIdx) => {
                    var x = ((xVal - this.globalMinX) / (this.globalMaxX - this.globalMinX) * this.canvas.width);
                    var y = this.canvas.height - ((sD.yCoordinates[xIdx] - this.globalMinY) / (this.globalMaxY - this.globalMinY) * this.canvas.height);
                    // draw dot
                    ctx.beginPath();
                    ctx.arc(x, y, 2, startPoint, endPoint, true);
                    ctx.fill();
                    ctx.closePath();
                    // draw connection
                    if (sD.connect && xIdx >= 1) {
                        var prevX = ((sD.xCoordinates[xIdx - 1] - this.globalMinX) / (this.globalMaxX - this.globalMinX) * this.canvas.width);
                        var prevY = this.canvas.height - ((sD.yCoordinates[xIdx - 1] - this.globalMinY) / (this.globalMaxY - this.globalMinY) * this.canvas.height);
                        ctx.beginPath();
                        ctx.moveTo(prevX, prevY);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            });
            return(0);
        };
    }]
}

angular.module('emuwebApp')
.component(DotsCanvasComponent.selector, DotsCanvasComponent);