import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

let OsciComponent = {
    selector: "osci",
    template: /*html*/`
    <div class="emuwebapp-timeline">
    <div class="emuwebapp-timelineCanvasContainer">
    
    <canvas 
    class="emuwebapp-timelineCanvasMain" 
    width="4096"></canvas>
    
    <!--
    <canvas 
    class="emuwebapp-timelineCanvasSSFF" 
    width="4096" 
    drawssff 
    ssff-trackname="{{$ctrl.trackName}}"></canvas>
    -->

    <ssff-canvas
    track-name="$ctrl.trackName"
    all-ssff-data="$ctrl.SsffDataService.data"
    view-port-sample-start="$ctrl.viewPortSampleStart"
    view-port-sample-end="$ctrl.viewPortSampleEnd"
    cur-bndl="$ctrl.curBundl"
    cur-mouse-x="$ctrl.curMouseX"
    cur-mouse-y="$ctrl.curMouseY"
    ></ssff-canvas>


    <signal-canvas-markup-canvas
    track-name="$ctrl.trackName"
    play-head-current-sample="$ctrl.playHeadCurrentSample"
    moving-boundary-sample="$ctrl.movingBoundarySample"
    cur-mouse-x="$ctrl.curMouseX" 
    moving-boundary="$ctrl.movingBoundary"
    view-port-sample-start="$ctrl.viewPortSampleStart"
    view-port-sample-end="$ctrl.viewPortSampleEnd"
    view-port-select-start="$ctrl.viewPortSelectStart"
    view-port-select-end="$ctrl.viewPortSelectEnd"
    cur-bndl="$ctrl.curBundl"
    ></signal-canvas-markup-canvas>
    `
    ,
    bindings: {
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
    controller: [
        '$scope', 
        '$element', 
        '$timeout', 
        'ViewStateService', 
        'SoundHandlerService', 
        'ConfigProviderService', 
        'SsffDataService',
        'DrawHelperService', 
        'LoadedMetaDataService',
        class OsciController{
        private $scope;
        private $element;
        private $timeout;
        private ViewStateService;
        private SoundHandlerService;
        private ConfigProviderService;
        private SsffDataService;
        private DrawHelperService;
        private LoadedMetaDataService;
        
        private canvasLength;
        private canvas;
        // private markupCanvas;
        private _inited;
        
        constructor(
            $scope, 
            $element, 
            $timeout, 
            ViewStateService, 
            SoundHandlerService, 
            ConfigProviderService, 
            SsffDataService,
            DrawHelperService, 
            LoadedMetaDataService
            ){
            this.$scope = $scope;
            this.$element = $element;
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.SoundHandlerService = SoundHandlerService;
            this.ConfigProviderService = ConfigProviderService;
            this.SsffDataService = SsffDataService;
            this.DrawHelperService = DrawHelperService;
            this.LoadedMetaDataService = LoadedMetaDataService;
            
            this._inited = false;
        };
        
        $postLink = function(){
            this.canvasLength = this.$element.find('canvas').length;
            this.canvas = this.$element.find('canvas')[0];
            // this.markupCanvas = this.$element.find('canvas')[this.canvasLength - 1];
            
        };
        
        $onChanges = function (changes) {
            //
            if(this._inited){
                //
                if(changes.timelineSize){
                    this.$timeout(this.redraw, styles.animationPeriod);
                }
                
                //
                if(changes.curBndl){
                    this.DrawHelperService.freshRedrawDrawOsciOnCanvas(this.canvas, this.viewPortSampleStart, this.viewPortSampleEnd, true);
                }
                //
                if(changes.viewPortSampleStart || changes.viewPortSampleEnd || changes.curChannel){
                    this.DrawHelperService.freshRedrawDrawOsciOnCanvas(this.canvas, this.viewPortSampleStart, this.viewPortSampleEnd, false);
                }
            }
            
        };
        
        $onInit = function() {
            this._inited = true;
        };
        

        
        
    }]
}

angular.module('emuwebApp')
.component(OsciComponent.selector, OsciComponent);