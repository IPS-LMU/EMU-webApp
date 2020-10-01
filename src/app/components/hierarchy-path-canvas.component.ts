import * as angular from 'angular';
import { fromEvent, Observable, Subscription } from "rxjs";
import { debounceTime, map } from 'rxjs/operators';

import { HierarchyWorker } from '../workers/hierarchy.worker';
import styles from '../../styles/EMUwebAppDesign.scss';

let HierarchyPathCanvasComponent = {
    selector: "hierarchyPathCanvas",
    // inline HTML
    template: /*html*/`
    <div 
    class="emuwebapp-level" 
    style="height: 256px">
    <div class="emuwebapp-level-container">
    <canvas 
    class="emuwebapp-level-canvas" 
    id="levelCanvas" 
    width="4096" 
    height="1024" 
    ng-style="$ctrl.backgroundCanvas"
    ></canvas>
    
    <canvas 
    class="emuwebapp-level-markup"
    style="background-color: rgba(200, 200, 200, 0.7); filter: blur(2px);"
    id="levelMarkupCanvas" 
    width="4096" 
    height="1024" 
    level-name="$ctrl.level.name"
    level-type="$ctrl.level.type"></canvas>
    </div>
    </div>

    <div 
ng-if="true" 
class="emuwebapp-selectAttrDef"
>
<!--<div>
    <ul>
    <li>
        <button 
        ng-click="$ctrl.changeCurAttrDef(attrDef.name, $index);" 
        ng-style="$ctrl.getAttrDefBtnColor(attrDef.name)"
        ></button>
        <button 
        ng-click="$ctrl.changeCurAttrDef(attrDef.name, $index);" 
        ng-style="$ctrl.getAttrDefBtnColor(attrDef.name)"
        ></button>
    </li>
    </ul>
</div>-->
</div>
    `,
    bindings: {
        annotation: '<',
        path: '<',
        idx: '<',
        viewPortSampleStart: '<',
        viewPortSampleEnd: '<',
        viewPortSelectStart: '<',
        viewPortSelectEnd: '<',
        curMouseX: '<',
        curClickLevelName: '<',
        movingBoundarySample: '<',
        movingBoundary: '<',
        movesAwayFromLastSave: '<',
        curPerspectiveIdx: '<',
        curBndl: '<'
    },
    controller: class HierarchyPathCanvasController{
        private $scope;
        private $element;
        private $animate;
        
        private ViewStateService;
        private ConfigProviderService;
        private DrawHelperService;
        private HistoryService;
        private FontScaleService;
        private ModalService;
        private LevelService;
        private LoadedMetaDataService;
        private HierarchyLayoutService;
        private DataService;
        
        private annotation;
        private path;
        private viewPortSampleStart;
        private viewPortSampleEnd;
        
        private open;
        private levelDef;
        private canvas;
        private levelCanvasContainer;
        private _inited;
        private backgroundCanvas;
        private hierPaths;

        // resizer
        private resizeObservable$: Observable<Event>
        private resizeSubscription$: Subscription
        
        constructor($scope, $element, $animate, ViewStateService, ConfigProviderService, DrawHelperService, HistoryService, FontScaleService, ModalService, LevelService, LoadedMetaDataService, HierarchyLayoutService, DataService){
            this.$scope = $scope;
            this.$element = $element;
            this.$animate = $animate;
            this.ViewStateService = ViewStateService;
            this.ConfigProviderService = ConfigProviderService;
            this.DrawHelperService = DrawHelperService;
            this.HistoryService = HistoryService;
            this.FontScaleService = FontScaleService;
            this.ModalService = ModalService;
            this.LevelService = LevelService;
            this.LoadedMetaDataService = LoadedMetaDataService;
            this.HierarchyLayoutService = HierarchyLayoutService;
            this.DataService = DataService;
            
            this.open = true;
            this._inited = false;
            this.backgroundCanvas = {
                'background': styles.colorBlack
                // 'background-image': 'linear-gradient(to top, #e2ebf0 0%, #cfd9df 100%)'
            };
            this.hierPaths = this.HierarchyLayoutService.findAllNonPartialPaths();
            
        };
        
        $postLink = function(){
            // levelDetailsDef = this.ConfigProviderService.getLevelDefinition(levelDetails.name);
            this.canvas = this.$element.find('canvas');
            this.levelCanvasContainer = this.$element.find('div');
            // if(this._inited){
            //     this.drawLevelDetails(this.canvas);
            //     this.drawLevelMarkup();
            // }
            
            ///////////////
            // bindings
            
            // on mouse leave reset ViewStateService.
            this.$element.bind('mouseleave', () => {
                this.ViewStateService.setcurMouseItem(undefined, undefined, undefined);
                this.drawLevelMarkup();
            });
            
            this.redrawAll()
        };
        
        $onChanges = function (changes) {
            if(this._inited){
                if(changes.viewPortSampleStart){
                    if(changes.viewPortSampleStart.currentValue !== changes.viewPortSampleStart.previousValue){
                        this.redrawAll()
                    }
                }
                if(changes.viewPortSampleEnd){
                    if(changes.viewPortSampleEnd.currentValue !== changes.viewPortSampleEnd.previousValue){
                        this.redrawAll()
                    }
                }
                if(changes.viewPortSelectStart){
                    if(changes.viewPortSelectStart.currentValue !== changes.viewPortSelectStart.previousValue){
                        this.drawLevelMarkup();
                    }
                }
                if(changes.viewPortSelectEnd){
                    if(changes.viewPortSelectEnd.currentValue !== changes.viewPortSelectEnd.previousValue){
                        this.drawLevelMarkup();
                    }
                }
                if(changes.curMouseX){
                    if(changes.curMouseX.currentValue !== changes.curMouseX.previousValue){
                        this.drawLevelMarkup();
                    }
                }
                if(changes.curClickLevelName){
                    if(changes.curClickLevelName.currentValue !== changes.curClickLevelName.previousValue){
                        this.drawLevelMarkup();
                    }
                }
                if(changes.movingBoundarySample){
                    if(changes.movingBoundarySample.currentValue !== changes.movingBoundarySample.previousValue){
                        this.drawLevelMarkup();
                        // if (levelDetails.name === this.ViewStateService.curMouseLevelName) {
                        //     this.drawLevelDetails(this.canvas);
                        // }
                        
                    }
                }
                if(changes.movingBoundary){
                    if(changes.movingBoundary.currentValue !== changes.movingBoundary.previousValue){
                        this.drawLevelMarkup();
                    }
                }
                if(changes.movesAwayFromLastSave){
                    if(changes.movesAwayFromLastSave.currentValue !== changes.movesAwayFromLastSave.previousValue){
                        this.redrawAll()
                    }
                }
                if(changes.curPerspectiveIdx){
                    if(changes.curPerspectiveIdx.currentValue !== changes.curPerspectiveIdx.previousValue){
                        this.redrawAll()
                    }
                }
                if(changes.curBndl){
                    if(changes.curBndl.currentValue !== changes.curBndl.previousValue){
                        this.redrawAll()
                    }
                }
            }
        };
        
        $onInit = function() {
            this._inited = true;
            this.resizeObservable$ = fromEvent(window, 'resize')
            this.resizeObservable$.pipe(debounceTime(1000)).subscribe( evt => {       
                // console.log('event: ', evt)
                this.redrawAll()
            })
        }
        
        
        private async redrawAll(){
            if(this.annotation.levels.length > 0){
                
                var ctx = this.canvas[0].getContext('2d');
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                
                if(this.path.length == 0){
                    // select first path if nothing is selected
                    var pathInfo = this.HierarchyLayoutService.findAllNonPartialPaths();
                    this.ViewStateService.hierarchyState.path = pathInfo.possible[0];
                    this.ViewStateService.hierarchyState.curPathIdx = 0;
                }

                let hierarchyWorker = await new HierarchyWorker();
                let reducedAnnotation = await hierarchyWorker.reduceAnnotationToViewableTimeAndPath(this.annotation, this.path, this.viewPortSampleStart, this.viewPortSampleEnd);
                
                let nrOfPxlsPerLevel = 1024 / this.path.length;
                
                let topLimitPxl = 0;
                let bottomLimitPxl = nrOfPxlsPerLevel;
                
                let pathClone = JSON.parse(JSON.stringify(this.path));
                
                await pathClone.reverse().forEach(async (levelName) => {
                    let levelDetails = await hierarchyWorker.getLevelDetails(levelName, reducedAnnotation);
                    this.drawLevelDetails(this.canvas, levelDetails, topLimitPxl, bottomLimitPxl);
                    this.drawLevelMarkup();
                    topLimitPxl = topLimitPxl + nrOfPxlsPerLevel;
                    bottomLimitPxl = bottomLimitPxl + nrOfPxlsPerLevel;
                })
                
            }
            
        }
        
        
        // TODO: move to draw helper service or new service and use from here and level.component
        private drawLevelDetails = async function (canvas, levelDetails, topLimitPxl: number = 0, bottomLimitPxl: number = 1024) {
            
            var labelFontFamily; // font family used for labels only
            var fontFamily = styles.fontSmallFamily; // font family used for everything else
            if(typeof this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.labelFontFamily === 'undefined'){
                labelFontFamily = styles.fontSmallFamily;
            }else{
                labelFontFamily = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.labelFontFamily;
            }
                        // TODO: probably better as input via binding
            var levelCanvasesFontScalingFactor = Number(localStorage.getItem('levelCanvasesFontScalingFactor'));
            if(levelCanvasesFontScalingFactor === 0){
                levelCanvasesFontScalingFactor = 100;
            }
            
            levelCanvasesFontScalingFactor = levelCanvasesFontScalingFactor / 100;

            var labelFontSize; // font family used for labels only
            var fontSize = parseInt(styles.fontSmallSize.slice(0, -2)); // font size used for everything else
            if(typeof this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.fontPxSize === 'undefined') {
                labelFontSize = parseInt(styles.fontSmallSize.slice(0, -2)) * levelCanvasesFontScalingFactor;
            }else{
                labelFontSize = this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.labelFontPxSize * levelCanvasesFontScalingFactor;
            }
            
            
            var curAttrDef = this.ViewStateService.getCurAttrDef(levelDetails.name);
            var isOpen = this.$element.parent().css('height') !== '25px';// ? false : true;
            if ($.isEmptyObject(levelDetails)) {
                //console.log('undef levelDetails');
                return;
            }
            if ($.isEmptyObject(this.ViewStateService)) {
                //console.log('undef ViewStateService');
                return;
            }
            if ($.isEmptyObject(this.ConfigProviderService)) {
                //console.log('undef config');
                return;
            }
            
            var ctx = canvas[0].getContext('2d');
            ctx.clearRect(0, topLimitPxl, ctx.canvas.width, bottomLimitPxl);
            // ctx.fillStyle = "pink";
            // ctx.fillRect(0, topLimitPxl, ctx.canvas.width, bottomLimitPxl - topLimitPxl);
            
            //predef vars
            var sDist, posS, posE;
            
            sDist = this.ViewStateService.getSampleDist(ctx.canvas.width);
            
            // draw name of level and type
            var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;
            
            if (levelDetails.name === curAttrDef) {

                fontSize -= 2;
                this.FontScaleService.drawUndistortedText(
                    ctx, 
                    levelDetails.name, 
                    fontSize, 
                    fontFamily, 
                    4, 
                    topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2, 
                    styles.colorWhite, 
                    true);

                    } else {
                        this.FontScaleService.drawUndistortedTextTwoLines(
                            ctx, 
                            levelDetails.name + ':' + curAttrDef,
                            '(' + levelDetails.type + ')', 
                            fontSize, 
                            fontFamily, 
                            4, 
                            topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2, 
                            styles.colorWhite, 
                            true);
                        }
                        
                        var curID = -1;
                        
                        
                        // calculate generic max with of single char (m char used)
                        var mTxtImgWidth = ctx.measureText('m').width * this.FontScaleService.scaleX;
                        
                        // calculate generic max with of single digit (0 digit used)
                        var zeroTxtImgWidth = ctx.measureText('0').width * this.FontScaleService.scaleX;
                        if (levelDetails.type === 'SEGMENT' || levelDetails.type === 'ITEM') {
                            ctx.fillStyle = styles.colorWhite;
                            // draw segments
                            levelDetails.items.forEach((item) => {
                                ++curID;
                                
                                if (item.sampleStart >= this.viewPortSampleStart &&
                                    item.sampleStart <= this.viewPortSampleEnd || //within segment
                                    item.sampleStart + item.sampleDur > this.viewPortSampleStart &&
                                    item.sampleStart + item.sampleDur < this.viewPortSampleEnd || //end in segment
                                    item.sampleStart < this.viewPortSampleStart &&
                                    item.sampleStart + item.sampleDur > this.viewPortSampleEnd // within sample
                                    ) {
                                        // get label
                                        var curLabVal;
                                        item.labels.forEach((lab) => {
                                            if (lab.name === curAttrDef) {
                                                curLabVal = lab.value;
                                            }
                                        });
                                        
                                        // draw segment start
                                        posS = this.ViewStateService.getPos(ctx.canvas.width, item.sampleStart);
                                        posE = this.ViewStateService.getPos(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);
                                        
                                        ctx.fillStyle = styles.colorWhite;
                                        ctx.fillRect(posS, topLimitPxl, 2, (bottomLimitPxl - topLimitPxl) / 2);
                                        
                                        //draw segment end
                                        ctx.fillStyle = styles.colorGrey;
                                        ctx.fillRect(posE, topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2, 2, (bottomLimitPxl - topLimitPxl) / 2);
                                        
                                        ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);
                                        
                                        //check for enough space to stroke text
                                        if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
                                            
                                            this.FontScaleService.drawUndistortedText(
                                                ctx, 
                                                curLabVal, 
                                                labelFontSize - 2, 
                                                labelFontFamily, 
                                                posS + (posE - posS) / 2, 
                                                (topLimitPxl + (bottomLimitPxl - topLimitPxl) / 2) - (fontSize - 2) + 2, 
                                                styles.colorWhite, 
                                                false);
                                                
                                            }
                                            
                                            //draw helper lines
                                            if (curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty
                                                var labelCenter = posS + (posE - posS) / 2;
                                                
                                                var hlY = topLimitPxl + (bottomLimitPxl - topLimitPxl) / 4;
                                                // start helper line
                                                ctx.strokeStyle = styles.colorWhite;
                                                ctx.beginPath();
                                                ctx.moveTo(posS, hlY);
                                                ctx.lineTo(labelCenter, hlY);
                                                ctx.lineTo(labelCenter, hlY + 5);
                                                ctx.stroke();
                                                
                                                hlY = topLimitPxl + (bottomLimitPxl - topLimitPxl) / 4 * 3;
                                                // end helper line
                                                ctx.strokeStyle = styles.colorGrey;
                                                ctx.beginPath();
                                                ctx.moveTo(posE, hlY);
                                                ctx.lineTo(labelCenter, hlY);
                                                ctx.lineTo(labelCenter, hlY - 5);
                                                ctx.stroke();
                                            }
                                            
                                            
                                            // draw sampleStart numbers
                                            //check for enough space to stroke text
                                            if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length && isOpen) {
                                                this.FontScaleService.drawUndistortedText(
                                                    ctx, 
                                                    item.sampleStart, 
                                                    fontSize - 4, 
                                                    fontFamily, 
                                                    posS + 3, 
                                                    topLimitPxl + (fontSize * scaleY) / 2, 
                                                    styles.colorBlue, 
                                                    true);
                                                }
                                                
                                                // draw sampleDur numbers.
                                                var durtext = 'dur: ' + item.sampleDur + ' ';
                                                //check for enough space to stroke text
                                                if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
                                                    this.FontScaleService.drawUndistortedText(
                                                        ctx, 
                                                        durtext, 
                                                        fontSize - 4, 
                                                        fontFamily, 
                                                        posE - (zeroTxtImgWidth * (durtext.length - 3)), 
                                                        topLimitPxl + (bottomLimitPxl - topLimitPxl) / 4 * 3 + (fontSize * scaleY) / 2, 
                                                        styles.colorBlue, 
                                                        true);
                                                    }
                                                }
                                            });
                                        } else if (levelDetails.type === 'EVENT') {
                                            ctx.fillStyle = styles.colorWhite;
                                            // predef. vars
                                            var perc;
                                            
                                            levelDetails.items.forEach((item) => {
                                                if (item.samplePoint > this.viewPortSampleStart && item.samplePoint < this.viewPortSampleEnd) {
                                                    perc = Math.round(this.ViewStateService.getPos(ctx.canvas.width, item.samplePoint) + (sDist / 2));
                                                    // get label
                                                    var curLabVal;
                                                    item.labels.forEach((lab) => {
                                                        if (lab.name === curAttrDef) {
                                                            curLabVal = lab.value;
                                                        }
                                                    });
                                                    
                                                    ctx.fillStyle = styles.colorWhite;
                                                    ctx.fillRect(perc, 0, 1, (bottomLimitPxl - topLimitPxl) / 2 - (bottomLimitPxl - topLimitPxl) / 5);
                                                    ctx.fillRect(perc, (bottomLimitPxl - topLimitPxl) / 2 + (bottomLimitPxl - topLimitPxl) / 5, 1, (bottomLimitPxl - topLimitPxl) / 2 - (bottomLimitPxl - topLimitPxl) / 5);
                                                    
                                                    this.FontScaleService.drawUndistortedText(
                                                        ctx, 
                                                        curLabVal, 
                                                        labelFontSize - 2, 
                                                        labelFontFamily, 
                                                        perc, 
                                                        ((bottomLimitPxl - topLimitPxl) / 2) - (fontSize - 2) + 2, 
                                                        styles.colorWhite, 
                                                        false);
                                                        if (isOpen) {
                                                            this.FontScaleService.drawUndistortedText(
                                                                ctx, 
                                                                item.samplePoint, 
                                                                fontSize - 2, 
                                                                labelFontFamily, 
                                                                perc + 5, 
                                                                0, 
                                                                styles.colorBlue, 
                                                                true);
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    console.error("bad level type");
                                                }
                                                // draw cursor/selected area
                                            };
                                            
                                            /**
                                            *
                                            */
                                            private drawLevelMarkup = function () {
                                                var ctx = this.canvas[1].getContext('2d');
                                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                                                
                                                // draw moving boundary line if moving
                                                this.DrawHelperService.drawMovingBoundaryLine(ctx);
                                                
                                                // draw current viewport selected
                                                this.DrawHelperService.drawCurViewPortSelected(ctx);
                                                
                                                
                                                var posS, posE, sDist, xOffset, item;
                                                posS = this.ViewStateService.getPos(ctx.canvas.width, this.ViewStateService.curViewPort.selectS);
                                                posE = this.ViewStateService.getPos(ctx.canvas.width, this.ViewStateService.curViewPort.selectE);
                                                sDist = this.ViewStateService.getSampleDist(ctx.canvas.width);
                                                
                                                
                                                var segMId = this.ViewStateService.getcurMouseItem();
                                                var isFirst = this.ViewStateService.getcurMouseisFirst();
                                                var isLast = this.ViewStateService.getcurMouseisLast();
                                                var clickedSegs = this.ViewStateService.getcurClickItems();
                                                var levelId = this.ViewStateService.getcurClickLevelName();
                                                
                                                // draw preselected boundary
                                                item = this.ViewStateService.getcurMouseItem();
                                                // if (levelDetails.items.length > 0 && item !== undefined && segMId !== undefined && levelDetails.name === this.ViewStateService.getcurMouseLevelName()) {
                                                //     ctx.fillStyle = styles.colorBlue;
                                                //     if (isFirst === true) { // before first segment
                                                //         if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
                                                //             item = levelDetails.items[0];
                                                //             posS = Math.round(this.ViewStateService.getPos(ctx.canvas.width, item.sampleStart));
                                                //             ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                                                //         }
                                                //     } else if (isLast === true) { // after last segment
                                                //         if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
                                                //             item = levelDetails.items[levelDetails.items.length - 1];
                                                //             posS = Math.round(this.ViewStateService.getPos(ctx.canvas.width, (item.sampleStart + item.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
                                                //             ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                                                //         }
                                                //     } else { // in the middle
                                                //         if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
                                                //             posS = Math.round(this.ViewStateService.getPos(ctx.canvas.width, item.sampleStart));
                                                //             ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                                                //         } else {
                                                //             posS = Math.round(this.ViewStateService.getPos(ctx.canvas.width, item.samplePoint));
                                                //             xOffset = (sDist / 2);
                                                //             ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);
                                                
                                                //         }
                                                //     }
                                                //     ctx.fillStyle = styles.colorWhite;
                                                
                                                // }
                                                
                                                // draw cursor
                                                this.DrawHelperService.drawCrossHairX(ctx, this.ViewStateService.curMouseX);
                                            };
                                        }
                                    };
                                    
                                    angular.module('emuwebApp')
                                    .component(HierarchyPathCanvasComponent.selector, HierarchyPathCanvasComponent);