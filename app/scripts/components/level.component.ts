import * as angular from 'angular';

let LevelComponent = {
    selector: "level",
    // inline HTML
    template: /*html*/`
<div class="emuwebapp-level">
<div class="emuwebapp-level-container">
    <canvas 
    class="emuwebapp-level-canvas" 
    id="levelCanvas" 
    width="2048" 
    height="64" 
    ng-style="$ctrl.backgroundCanvas"
    ></canvas>

    <canvas 
    class="emuwebapp-level-markup" 
    id="levelMarkupCanvas" 
    width="2048" 
    height="64" 
    track-mouse-in-level="{{idx}}"
    level-name="$ctrl.level.name"
    level-type="$ctrl.level.type"></canvas>
</div>
</div>

<div 
ng-if="$ctrl.levelDef.attributeDefinitions.length > 1" 
class="emuwebapp-selectAttrDef"
>
<div>
    <ul>
    <li ng-repeat="attrDef in $ctrl.levelDef.attributeDefinitions">
        <button 
        ng-click="$ctrl.changeCurAttrDef(attrDef.name, $index);" 
        ng-style="$ctrl.getAttrDefBtnColor(attrDef.name)"
        ></button>
    </li>
    </ul>
</div>
</div>  
    `,
    bindings: {
        level: '<',
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
    controller: class GhostLevelController{
        private $scope;
        private $element;
        private $animate;

        private viewState;
        private ConfigProviderService;
        private Drawhelperservice;
        private HistoryService;
        private fontScaleService;
        private modalService;
        private LevelService;
        private loadedMetaDataService;
        private HierarchyLayoutService;
        private DataService;
        
        private open;
        private levelDef;
        private canvas;
        private levelCanvasContainer;
        private _inited;
        private backgroundCanvas;

        constructor($scope, $element, $animate, viewState, ConfigProviderService, Drawhelperservice, HistoryService, fontScaleService, modalService, LevelService, loadedMetaDataService, HierarchyLayoutService, DataService){
            this.$scope = $scope;
            this.$element = $element;
            this.$animate = $animate;
            this.viewState = viewState;
            this.ConfigProviderService = ConfigProviderService;
            this.Drawhelperservice = Drawhelperservice;
            this.HistoryService = HistoryService;
            this.fontScaleService = fontScaleService;
            this.modalService = modalService;
            this.LevelService = LevelService;
            this.loadedMetaDataService = loadedMetaDataService;
            this.HierarchyLayoutService = HierarchyLayoutService;
            this.DataService = DataService;

            this.open = true;
            this._inited = false;
            this.backgroundCanvas = {
                'background': ConfigProviderService.design.color.black
            };
        };
        
        $postLink = function(){
            this.levelDef = this.ConfigProviderService.getLevelDefinition(this.level.name);

            this.canvas = this.$element.find('canvas');
            this.levelCanvasContainer = this.$element.find('div');
            if(this._inited){
                this.drawLevelDetails();
                this.drawLevelMarkup();
            }
            ///////////////
            // bindings

            // on mouse leave reset viewState.
            this.$element.bind('mouseleave', () => {
                this.viewState.setcurMouseItem(undefined, undefined, undefined);
                this.drawLevelMarkup();
            });
        };

        $onChanges = function (changes) {
            if(changes.viewPortSampleStart){
                if(changes.viewPortSampleStart.currentValue !== changes.viewPortSampleStart.previousValue){
                    if(this._inited){
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.viewPortSampleEnd){
                if(changes.viewPortSampleEnd.currentValue !== changes.viewPortSampleEnd.previousValue){
                    if(this._inited){
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.viewPortSelectStart){
                if(changes.viewPortSelectStart.currentValue !== changes.viewPortSelectStart.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.viewPortSelectEnd){
                if(changes.viewPortSelectEnd.currentValue !== changes.viewPortSelectEnd.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.curMouseX){
                if(changes.curMouseX.currentValue !== changes.curMouseX.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.curClickLevelName){
                if(changes.curClickLevelName.currentValue !== changes.curClickLevelName.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.movingBoundarySample){
                if(changes.movingBoundarySample.currentValue !== changes.movingBoundarySample.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                        if (this.level.name === this.viewState.curMouseLevelName) {
                            this.drawLevelDetails();
                        }
                    }
                }
            }
            if(changes.movingBoundary){
                if(changes.movingBoundary.currentValue !== changes.movingBoundary.previousValue){
                    if(this._inited){
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.movesAwayFromLastSave){
                if(changes.movesAwayFromLastSave.currentValue !== changes.movesAwayFromLastSave.previousValue){
                    if(this._inited){
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.curPerspectiveIdx){
                if(changes.curPerspectiveIdx.currentValue !== changes.curPerspectiveIdx.previousValue){
                    if(this._inited){
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    }
                }
            }
            if(changes.curBndl){
                if(changes.curBndl.currentValue !== changes.curBndl.previousValue){
                    if(this._inited){
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    }
                }
            }

        };

        $onInit = function() {
            this._inited = true;
        }

        // $doCheck = function(){
        //     console.log(this.level);
        //     console.log(this.viewPortSampleStart);
        //     console.log(this.viewPortSampleEnd);
        //     console.log("in $doCheck");
        // }

        /**
         *
         */
        private changeCurAttrDef = function (attrDefName, index) {
            var curAttrDef = this.viewState.getCurAttrDef(this.level.name);
            if (curAttrDef !== attrDefName) {
                // curAttrDef = attrDefName;
                this.viewState.setCurAttrDef(this.level.name, attrDefName, index);

                if (!this.$element.hasClass('emuwebapp-level-animation')) {
                    this.viewState.setEditing(false);
                    this.LevelService.deleteEditArea();
                    this.$animate.addClass(this.levelCanvasContainer, 'emuwebapp-level-animation').then(() => {
                        this.$animate.removeClass(this.levelCanvasContainer, 'emuwebapp-level-animation');
                        // redraw
                        this.drawLevelDetails();
                        this.drawLevelMarkup();
                    });
                }
            }
        };

        /**
         *
         */
        private getAttrDefBtnColor = function (attrDefName) {
            var curColor;
            var curAttrDef = this.viewState.getCurAttrDef(this.level.name);
            if (attrDefName === curAttrDef) {
                curColor = {
                    'background': '-webkit-radial-gradient(50% 50%, closest-corner, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%)'
                };
            } else {
                curColor = {
                    'background-color': 'white'
                };
            }
            return curColor;
        };


        private drawLevelDetails = function () {
            var labelFontFamily; // font family used for labels only
            var fontFamily = this.ConfigProviderService.design.font.small.family; // font family used for everything else
            if(typeof this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.labelFontFamily === 'undefined'){
                labelFontFamily = this.ConfigProviderService.design.font.small.family;
            }else{
                labelFontFamily = this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.labelFontFamily;
            }

            var labelFontSize; // font family used for labels only
            var fontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1; // font size used for everything else
            if(typeof this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.fontPxSize === 'undefined') {
                labelFontSize = this.ConfigProviderService.design.font.small.size.slice(0, -2) * 1;
            }else{
                labelFontSize = this.ConfigProviderService.vals.perspectives[this.viewState.curPerspectiveIdx].levelCanvases.labelFontPxSize;
            }


            var curAttrDef = this.viewState.getCurAttrDef(this.level.name);
            var isOpen = this.$element.parent().css('height') !== '25px';// ? false : true;
            if ($.isEmptyObject(this.level)) {
                //console.log('undef levelDetails');
                return;
            }
            if ($.isEmptyObject(this.viewState)) {
                //console.log('undef viewState');
                return;
            }
            if ($.isEmptyObject(this.ConfigProviderService)) {
                //console.log('undef config');
                return;
            }

            var ctx = this.canvas[0].getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            //predef vars
            var sDist, posS, posE;

            sDist = this.viewState.getSampleDist(ctx.canvas.width);

            // draw name of level and type
            var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;

            if (this.level.name === curAttrDef) {
                if (isOpen) {
                    this.fontScaleService.drawUndistortedTextTwoLines(
                        ctx, 
                        this.level.name, 
                        '(' + this.level.type + ')', 
                        fontSize, 
                        fontFamily, 
                        4, 
                        ctx.canvas.height / 2 - fontSize * scaleY, 
                        this.ConfigProviderService.design.color.white, 
                        true);
                }
                else {
                    fontSize -= 2;
                    this.fontScaleService.drawUndistortedText(
                        ctx, 
                        this.level.name, 
                        fontSize, 
                        fontFamily, 
                        4, 
                        ctx.canvas.height / 2 - (fontSize * scaleY / 2), 
                        this.ConfigProviderService.design.color.white, true);
                }
            } else {
                this.fontScaleService.drawUndistortedTextTwoLines(
                    ctx, 
                    this.level.name + ':' + curAttrDef, 
                    '(' + this.level.type + ')', 
                    fontSize, 
                    fontFamily, 
                    4, 
                    ctx.canvas.height / 2 - fontSize * scaleY, 
                    this.ConfigProviderService.design.color.white, 
                    true);
            }

            var curID = -1;

            // calculate generic max with of single char (m char used)
            var mTxtImgWidth = ctx.measureText('m').width * this.fontScaleService.scaleX;

            // calculate generic max with of single digit (0 digit used)
            var zeroTxtImgWidth = ctx.measureText('0').width * this.fontScaleService.scaleX;
            if (this.level.type === 'SEGMENT') {
                ctx.fillStyle = this.ConfigProviderService.design.color.white;
                // draw segments
                this.level.items.forEach((item) => {
                    ++curID;

                    if (item.sampleStart >= this.viewState.curViewPort.sS &&
                        item.sampleStart <= this.viewState.curViewPort.eS || //within segment
                        item.sampleStart + item.sampleDur > this.viewState.curViewPort.sS &&
                        item.sampleStart + item.sampleDur < this.viewState.curViewPort.eS || //end in segment
                        item.sampleStart < this.viewState.curViewPort.sS &&
                        item.sampleStart + item.sampleDur > this.viewState.curViewPort.eS // within sample
                    ) {
                        // get label
                        var curLabVal;
                        item.labels.forEach((lab) => {
                            if (lab.name === curAttrDef) {
                                curLabVal = lab.value;
                            }
                        });

                        // draw segment start
                        posS = this.viewState.getPos(ctx.canvas.width, item.sampleStart);
                        posE = this.viewState.getPos(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);

                        ctx.fillStyle = this.ConfigProviderService.design.color.white;
                        ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

                        //draw segment end
                        ctx.fillStyle = this.ConfigProviderService.design.color.grey;
                        ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

                        ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);

                        //check for enough space to stroke text
                        if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
                            if (isOpen) {
                                this.fontScaleService.drawUndistortedText(
                                    ctx, 
                                    curLabVal, 
                                    labelFontSize - 2, 
                                    labelFontFamily, 
                                    posS + (posE - posS) / 2, 
                                    (ctx.canvas.height / 2) - (fontSize - 2) + 2, 
                                    this.ConfigProviderService.design.color.white, 
                                    false);
                            } else {
                                this.fontScaleService.drawUndistortedText(
                                    ctx, 
                                    curLabVal, 
                                    labelFontSize - 2, 
                                    labelFontFamily, 
                                    posS + (posE - posS) / 2, 
                                    (ctx.canvas.height / 2) - fontSize + 2, 
                                    this.ConfigProviderService.design.color.white, 
                                    false);
                            }
                        }

                        //draw helper lines
                        if (this.open && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty
                            var labelCenter = posS + (posE - posS) / 2;

                            var hlY = ctx.canvas.height / 4;
                            // start helper line
                            ctx.strokeStyle = this.ConfigProviderService.design.color.white;
                            ctx.beginPath();
                            ctx.moveTo(posS, hlY);
                            ctx.lineTo(labelCenter, hlY);
                            ctx.lineTo(labelCenter, hlY + 5);
                            ctx.stroke();

                            hlY = ctx.canvas.height / 4 * 3;
                            // end helper line
                            ctx.strokeStyle = this.ConfigProviderService.design.color.grey;
                            ctx.beginPath();
                            ctx.moveTo(posE, hlY);
                            ctx.lineTo(labelCenter, hlY);
                            ctx.lineTo(labelCenter, hlY - 5);
                            ctx.stroke();
                        }

                        if (this.open){
                            // draw sampleStart numbers
                            //check for enough space to stroke text
                            if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length && isOpen) {
                                this.fontScaleService.drawUndistortedText(
                                    ctx, 
                                    item.sampleStart, 
                                    fontSize - 2, 
                                    fontFamily, 
                                    posS + 3, 
                                    0, 
                                    this.ConfigProviderService.design.color.grey, 
                                    true);
                            }

                            // draw sampleDur numbers.
                            var durtext = 'dur: ' + item.sampleDur + ' ';
                            //check for enough space to stroke text
                            if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
                                this.fontScaleService.drawUndistortedText(
                                    ctx, 
                                    durtext, 
                                    fontSize - 2, 
                                    fontFamily, 
                                    posE - (ctx.measureText(durtext).width * this.fontScaleService.scaleX), 
                                    ctx.canvas.height / 4 * 3, 
                                    this.ConfigProviderService.design.color.grey, 
                                    true);
                            }
                        }
                    }
                });
            } else if (this.level.type === 'EVENT') {
                ctx.fillStyle = this.ConfigProviderService.design.color.white;
                // predef. vars
                var perc;

                this.level.items.forEach((item) => {
                    if (item.samplePoint > this.viewState.curViewPort.sS && item.samplePoint < this.viewState.curViewPort.eS) {
                        perc = Math.round(this.viewState.getPos(ctx.canvas.width, item.samplePoint) + (sDist / 2));
                        // get label
                        var curLabVal;
                        item.labels.forEach((lab) => {
                            if (lab.name === curAttrDef) {
                                curLabVal = lab.value;
                            }
                        });

                        ctx.fillStyle = this.ConfigProviderService.design.color.white;
                        ctx.fillRect(perc, 0, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);
                        ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);

                        this.fontScaleService.drawUndistortedText(
                            ctx, 
                            curLabVal, 
                            labelFontSize - 2, 
                            labelFontFamily, 
                            perc, 
                            (ctx.canvas.height / 2) - (fontSize - 2) + 2, 
                            this.ConfigProviderService.design.color.white, 
                            false);
                        if (isOpen) {
                            this.fontScaleService.drawUndistortedText(
                                ctx, 
                                item.samplePoint, 
                                fontSize - 2, 
                                labelFontFamily, 
                                perc + 5, 
                                0, 
                                this.ConfigProviderService.design.color.grey, 
                                true);
                        }
                    }
                });
            }
            // draw cursor/selected area
        };

        /**
         *
         */
        private drawLevelMarkup = function () {
            var ctx = this.canvas[1].getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (this.level.name === this.viewState.getcurClickLevelName()) {
                ctx.fillStyle = this.ConfigProviderService.design.color.transparent.grey;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }

            // draw moving boundary line if moving
            this.Drawhelperservice.drawMovingBoundaryLine(ctx);

            // draw current viewport selected
            this.Drawhelperservice.drawCurViewPortSelected(ctx);


            var posS, posE, sDist, xOffset, item;
            posS = this.viewState.getPos(ctx.canvas.width, this.viewState.curViewPort.selectS);
            posE = this.viewState.getPos(ctx.canvas.width, this.viewState.curViewPort.selectE);
            sDist = this.viewState.getSampleDist(ctx.canvas.width);


            var segMId = this.viewState.getcurMouseItem();
            var isFirst = this.viewState.getcurMouseisFirst();
            var isLast = this.viewState.getcurMouseisLast();
            var clickedSegs = this.viewState.getcurClickItems();
            var levelId = this.viewState.getcurClickLevelName();
            if (clickedSegs !== undefined) {
                // draw clicked on selected areas
                if (this.level.name === levelId && clickedSegs.length > 0) {
                    clickedSegs.forEach((cs) => {
                        if (cs !== undefined) {
                            // check if segment or event level
                            if (cs.sampleStart !== undefined) {
                                posS = Math.round(this.viewState.getPos(ctx.canvas.width, cs.sampleStart));
                                posE = Math.round(this.viewState.getPos(ctx.canvas.width, cs.sampleStart + cs.sampleDur + 1));
                            } else {
                                posS = Math.round(this.viewState.getPos(ctx.canvas.width, cs.samplePoint) + sDist / 2);
                                posS = posS - 5;
                                posE = posS + 10;
                            }
                            ctx.fillStyle = this.ConfigProviderService.design.color.transparent.yellow;
                            ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
                            ctx.fillStyle = this.ConfigProviderService.design.color.white;
                        }
                    });
                }
            }


            // draw preselected boundary
            item = this.viewState.getcurMouseItem();
            if (this.level.items.length > 0 && item !== undefined && segMId !== undefined && this.level.name === this.viewState.getcurMouseLevelName()) {
                ctx.fillStyle = this.ConfigProviderService.design.color.blue;
                if (isFirst === true) { // before first segment
                    if (this.viewState.getcurMouseLevelType() === 'SEGMENT') {
                        item = this.level.items[0];
                        posS = Math.round(this.viewState.getPos(ctx.canvas.width, item.sampleStart));
                        ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                    }
                } else if (isLast === true) { // after last segment
                    if (this.viewState.getcurMouseLevelType() === 'SEGMENT') {
                        item = this.level.items[this.level.items.length - 1];
                        posS = Math.round(this.viewState.getPos(ctx.canvas.width, (item.sampleStart + item.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
                        ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                    }
                } else { // in the middle
                    if (this.viewState.getcurMouseLevelType() === 'SEGMENT') {
                        posS = Math.round(this.viewState.getPos(ctx.canvas.width, item.sampleStart));
                        ctx.fillRect(posS, 0, 3, ctx.canvas.height);
                    } else {
                        posS = Math.round(this.viewState.getPos(ctx.canvas.width, item.samplePoint));
                        xOffset = (sDist / 2);
                        ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);

                    }
                }
                ctx.fillStyle = this.ConfigProviderService.design.color.white;

            }

            // draw cursor
            this.Drawhelperservice.drawCrossHairX(ctx, this.viewState.curMouseX);
        };
    }
};

angular.module('emuwebApp')
    .component(LevelComponent.selector, LevelComponent);