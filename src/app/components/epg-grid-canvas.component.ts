import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let EpgGridCanvasComponent = {
    selector: "epgGridCanvas",
    template: /*html*/`
    <div class="emuwebapp-twoDimCanvasContainer">
        <canvas width="512" height="512">
    </canvas></div>'
    `,
    bindings: {
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
        class EpgGridCanvasController {
        private $scope;
        private $element;
        private ViewStateService;
        private ConfigProviderService
        private SoundHandlerService;
        private SsffDataService;
        private FontScaleService;

        private canvas;
        private _inited; 

        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            ConfigProviderService, 
            SoundHandlerService,
            SsffDataService, 
            FontScaleService
            ){
            this.$scope = $scope;
            this.$element = $element;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService
            this.SoundHandlerService = SoundHandlerService;
            this.SsffDataService = SsffDataService;
            this.FontScaleService = FontScaleService;

            this._inited = false;
        };

        $postLink (){
            this.canvas = this.$element.find('canvas')[0];
        };
        
        $onChanges (changes) {
            //
            if(this._inited){
                // redraw on all changes
                this.drawEpgGrid();
            }
            
        };
        

        $onInit () {
            this._inited = true;
        };

        /**
         * drawing method to drawEpgGrid
         */
        private drawEpgGrid () {

            var ctx = this.canvas.getContext('2d');
            let tr = this.ConfigProviderService.getSsffTrackConfig('EPG'); // SIC SIC SIC hardcoded for now although it might stay that way because it only is allowed to draw epg data anyway
            let col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
            if(typeof col !== 'undefined'){
                let sRaSt = this.SsffDataService.getSampleRateAndStartTimeOfTrack(tr.name);
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = 'green';
                ctx.strokeStyle = styles.colorBlack;
                ctx.font = (styles.fontInputSize.slice(0, -2) + 'px' + ' ' + styles.fontInputFamily);

                var gridWidth = this.canvas.width / 8;
                var gridHeight = this.canvas.height / 8;
                var sInterv = 1 / sRaSt.sampleRate - sRaSt.startTime;
                var curFrame = Math.round((this.ViewStateService.curMousePosSample / this.SoundHandlerService.audioBuffer.sampleRate) / sInterv);
                var binValStrArr;
                var curFrameVals = angular.copy(col.values[curFrame]);
                curFrameVals.reverse();

                curFrameVals.forEach((el, elIdx) => {
                    binValStrArr = el.toString(2).split('').reverse();
                    // pad with zeros
                    while (binValStrArr.length < 8) {
                        binValStrArr.push('0');
                    }

                    binValStrArr.forEach((binStr, binStrIdx) => {
                        if (binStr === '1') {
                            ctx.fillStyle = 'grey';
                            ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
                        } else {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(binStrIdx * gridWidth + 5, gridHeight * elIdx + 5, gridWidth - 10, gridHeight - 10);
                        }
                    });
                });

                // draw labels
                this.FontScaleService.drawUndistortedTextTwoLines(ctx, 'EPG', 'Frame:' + curFrame, parseInt(styles.fontInputSize.slice(0, -2)) * 3 / 4, styles.fontInputFamily, 5, 0, styles.colorBlack, true);
            }
        };
    }]
}

angular.module('emuwebApp')
.component(EpgGridCanvasComponent.selector, EpgGridCanvasComponent);