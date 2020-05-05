import * as angular from 'angular';

let OsciComponent = {
    selector: "osci",
    template: `
    <div class="emuwebapp-timeline">
    <div class="emuwebapp-timelineCanvasContainer">
    <canvas class="emuwebapp-timelineCanvasMain" 
    width="2048"></canvas>
    <canvas class="emuwebapp-timelineCanvasSSFF" 
    width="2048" 
    drawssff 
    ssff-trackname="{{$ctrl.trackName}}"></canvas>
    <canvas class="emuwebapp-timelineCanvasMarkup" 
    width="2048" 
    mouse-track-and-correction-tool ssff-trackname="{{$ctrl.trackName}}"></canvas>
    </div>
    </div>
    `
    ,
    bindings: {
        order: '<',
        trackName: '<',
        curChannel: '<',
        lastUpdate: '<',
        timelineSize: '<',
        curPerspectiveIdx: '<',
        playHeadCurrentSample: '<',
        movingBoundarySample: '<',
        curMouseX: '<',
        movingBoundary: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<',
        curBndl: '<'
    },
    controller: class OsciController{
        private $scope;
        private $element;
        private $timeout;
        private ViewStateService;
        private SoundHandlerService;
        private ConfigProviderService;
        private DrawHelperService;
        private LoadedMetaDataService;
        
        private canvasLength;
        private canvas;
        private markupCanvas;
        private _inited;
        
        constructor($scope, $element, $timeout, ViewStateService, SoundHandlerService, ConfigProviderService, DrawHelperService, LoadedMetaDataService){
            this.$scope = $scope;
            this.$element = $element;
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.SoundHandlerService = SoundHandlerService;
            this.ConfigProviderService = ConfigProviderService;
            this.DrawHelperService = DrawHelperService;
            this.LoadedMetaDataService = LoadedMetaDataService;
            
            this._inited = false;
        };
        
        $postLink = function(){
            this.canvasLength = this.$element.find('canvas').length;
            this.canvas = this.$element.find('canvas')[0];
            this.markupCanvas = this.$element.find('canvas')[this.canvasLength - 1];
            
        };
        
        $onChanges = function (changes) {
            //
            if(this._inited){
                //
                if(changes.timelineSize){
                    this.$timeout(this.redraw, this.ConfigProviderService.design.animation.duration);
                }
                // 
                if(changes.playHeadCurrentSample){
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        this.drawPlayHead();
                    }
                }

                //
                if(changes.curMouseX){
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        // only draw corsshair x line if mouse currently not over canvas
                        if(this.ViewStateService.curMouseTrackName !== this.trackName) {
                            this.drawVpOsciMarkup(true);
                        }
                    }
                }
                //
                if(changes.movingBoundary || changes.movingBoundarySample || changes.curPerspectiveIdx || changes.lastUpdate){
                    if (!$.isEmptyObject(this.SoundHandlerService.audioBuffer)) {
                        this.drawVpOsciMarkup(true);
                    }
                }
                //
                if(changes.curChannel || changes.viewPortSampleStart || changes.viewPortSampleEnd){
                    this.DrawHelperService.freshRedrawDrawOsciOnCanvas(this.canvas, this.viewPortSampleStart, this.viewPortSampleEnd, false);
                    this.drawVpOsciMarkup(true);
                    
                }
                
                //
                if(changes.viewPortSelectStart || changes.viewPortSelectEnd){
                    this.drawVpOsciMarkup(true);
                }
                
                //
                if(changes.curBndl){
                    this.DrawHelperService.freshRedrawDrawOsciOnCanvas(this.canvas, this.viewPortSampleStart, this.viewPortSampleEnd, true);
                }
            }
            
        };
        
        $onInit = function() {
            this._inited = true;
        };
        
        private redraw = function () {
            this.$scope.drawVpOsciMarkup(this.$scope, this.ConfigProviderService, true);
        };
        
        /**
        *
        */
        private drawPlayHead = function () {
            var ctx = this.markupCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var posS = this.ViewStateService.getPos(this.markupCanvas.width, this.ViewStateService.playHeadAnimationInfos.sS);
            var posCur = this.ViewStateService.getPos(this.markupCanvas.width, this.ViewStateService.playHeadAnimationInfos.curS);
            ctx.fillStyle = this.ConfigProviderService.design.color.transparent.lightGrey;
            ctx.fillRect(posS, 0, posCur - posS, this.canvas.height);
            this.drawVpOsciMarkup(false);
        };
        
        /**
        * draws markup of osci according to
        * the information that is specified in
        * the viewport
        */
        private drawVpOsciMarkup = function (reset) {
            var ctx = this.markupCanvas.getContext('2d');
            if (reset) {
                ctx.clearRect(0, 0, this.markupCanvas.width, this.markupCanvas.height);
            }
            // draw moving boundary line if moving
            this.DrawHelperService.drawMovingBoundaryLine(ctx);
            this.DrawHelperService.drawViewPortTimes(ctx, true);
            // draw current viewport selected
            this.DrawHelperService.drawCurViewPortSelected(ctx, true);
            
            this.DrawHelperService.drawCrossHairX(ctx, this.ViewStateService.curMouseX);
        };
        
        
    }
}

angular.module('emuwebApp')
.component(OsciComponent.selector, OsciComponent);