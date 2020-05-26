import * as angular from 'angular';

let SsffTrackComponent = {
    selector: "ssffTrack",
    template: `
    <div class="emuwebapp-timeline">
    <div class="emuwebapp-timelineCanvasContainer">
        <canvas 
        class="emuwebapp-timelineCanvasMain" 
        width="4096">
        </canvas>
        
        <canvas 
        class="emuwebapp-timelineCanvasSSFF" 
        width="4096" 
        drawssff ssff-trackname="{{$ctrl.trackName}}">
        </canvas>
        
        <canvas 
        class="emuwebapp-timelineCanvasMarkup" 
        width="4096" 
        mouse-track-and-correction-tool ssff-trackname="{{$ctrl.trackName}}">
        </canvas>
    </div>
    </div>
    `
    ,
    bindings: {
        trackName: '<',
        curMouseX: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<'
    },
    controller: class OsciController{
        private $element;
        private ConfigProviderService;
        private SsffDataService;
        private DrawHelperService;

        private ctx;
        private _intited;
        
        constructor($element, ConfigProviderService, SsffDataService, DrawHelperService){
            this.$element = $element;
            this.ConfigProviderService = ConfigProviderService;
            this.SsffDataService = SsffDataService;
            this.DrawHelperService = DrawHelperService;
            
        };
        
        $postLink = function(){
            this.ctx = this.$element.find('canvas')[2].getContext("2d");
            
        };

        $onChanges = function (changes) {
            //
            if(this._inited){                
                //
                if(changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.viewPortSelectStart || changes.viewPortSelectEnd){
                    if(this.SsffDataService.data.length !== 0){
                        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                        var tr = this.ConfigProviderService.getSsffTrackConfig(this.trackName);
                        var col = this.SsffDataService.getColumnOfTrack(tr.name, tr.columnName);
                        this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                        this.DrawHelperService.drawMinMaxAndName(this.ctx, this.trackName, col._minVal, col._maxVal, 2);
                    }
                }
                if(changes.curMouseX){
                    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    this.DrawHelperService.drawCurViewPortSelected(this.ctx, false);
                }
                
            }
            
        };
        
        $onInit = function() {
            this._inited = true;

        };
    }
}


angular.module('emuwebApp')
.component(SsffTrackComponent.selector, SsffTrackComponent);