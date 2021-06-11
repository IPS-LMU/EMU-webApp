import * as angular from 'angular';

let SsffTrackComponent = {
    selector: "ssffTrack",
    template: /*html*/`
    <div class="emuwebapp-timeline">
    <div class="emuwebapp-timelineCanvasContainer">
        <canvas 
        class="emuwebapp-timelineCanvasMain" 
        width="4096">
        </canvas>
        
        <!--
        <canvas 
        class="emuwebapp-timelineCanvasSSFF" 
        width="4096" 
        drawssff ssff-trackname="{{$ctrl.trackName}}">
        </canvas>
        -->
        
        <ssff-canvas
        track-name="$ctrl.trackName"
        all-ssff-data="$ctrl.SsffDataService.data"
        view-port-sample-start="$ctrl.viewPortSampleStart"
        view-port-sample-end="$ctrl.viewPortSampleEnd"
        cur-bndl="$ctrl.curBundl"
        cur-mouse-x="$ctrl.curMouseX"
        cur-mouse-y="$ctrl.curMouseY"
        moves-away-from-last-save="$ctrl.HistoryService.movesAwayFromLastSave"
        ></ssff-canvas>

        
        <signal-canvas-markup-canvas
        track-name="$ctrl.trackName"
        play-head-current-sample="$ctrl.playHeadCurrentSample"
        moving-boundary-sample="$ctrl.movingBoundarySample"
        cur-mouse-x="$ctrl.curMouseX"
        cur-mouse-y="$ctrl.curMouseY"
        moving-boundary="$ctrl.movingBoundary"
        view-port-sample-start="$ctrl.viewPortSampleStart"
        view-port-sample-end="$ctrl.viewPortSampleEnd"
        view-port-select-start="$ctrl.viewPortSelectStart"
        view-port-select-end="$ctrl.viewPortSelectEnd"
        cur-bndl="$ctrl.curBundl"
        ></signal-canvas-markup-canvas>
    </div>
    </div>
    `
    ,
    bindings: {
        trackName: '<',
        playHeadCurrentSample: '<',
        movingBoundarySample: '<',
        curMouseX: '<',
        curMouseY: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<'
    },
    controller: [
        '$element', 
        'ConfigProviderService', 
        'SsffDataService', 
        'DrawHelperService',
        'HistoryService',
        class OsciController{
        private $element;
        private ConfigProviderService;
        private SsffDataService;
        private DrawHelperService;
        private HistoryService;

        private ctx;
        private _inited;
        
        constructor(
            $element, 
            ConfigProviderService, 
            SsffDataService, 
            DrawHelperService, 
            HistoryService,
            ){
            this.$element = $element;
            this.ConfigProviderService = ConfigProviderService;
            this.SsffDataService = SsffDataService;
            this.DrawHelperService = DrawHelperService;
            this.HistoryService = HistoryService;
            
        };
        
        $postLink (){
            this.ctx = this.$element.find('canvas')[2].getContext("2d");
            
        };

        $onChanges (changes) {
            //
            if(this._inited){                
                //
                // if(changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.viewPortSelectStart || changes.viewPortSelectEnd){
                //     if(this.SsffDataService.data.length !== 0){
                //         this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                //         var tr = this.ConfigProviderService.getSsffTrackConfig(this.trackName);
                //         var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                //         this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                //         this.DrawHelperService.drawMinMaxAndName(this.ctx, this.trackName, col._minVal, col._maxVal, 2);
                //     }
                // }
                // if(changes.curMouseX){
                //     this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                //     this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                // }
                
            }
            
        };
        
        $onInit () {
            this._inited = true;

        };
    }]
}


angular.module('emuwebApp')
.component(SsffTrackComponent.selector, SsffTrackComponent);