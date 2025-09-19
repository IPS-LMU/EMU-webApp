import * as angular from 'angular';

let LevelCanvasMarkupCanvasComponent = {
    selector: "levelCanvasMarkupCanvas",
    template: /*html*/`
    <canvas 
    class="emuwebapp-level-markup" 
    id="levelMarkupCanvas" 
    width="4096" 
    height="256" 
    ></canvas>
    `,
    bindings: {
        level: '<',
        idx: '<'
    },
    controller: [
        '$scope', 
        '$element', 
        'ViewStateService', 
        'SoundHandlerService', 
        'ConfigProviderService', 
        'LevelService', 
        'HistoryService',
        class LevelCanvasMarkupCanvasController{
        private $scope;
        private $element;

        private ViewStateService;
        private SoundHandlerService;
        private ConfigProviderService;
        private LevelService;
        private HistoryService;

        // bindings
        private level;
        private idx;

        private lastEventClick;
        private lastEventMove;
        private lastNeighboursMove;
        private lastPCM;
        private curMouseSampleNrInView;

        constructor(
            $scope, 
            $element, 
            ViewStateService, 
            SoundHandlerService, 
            ConfigProviderService, 
            LevelService, 
            HistoryService
            ){
            this.$scope = $scope;
            this.$element = $element;
            
            this.ViewStateService = ViewStateService; 
            this.SoundHandlerService = SoundHandlerService;
            this.ConfigProviderService = ConfigProviderService;
            this.LevelService = LevelService;
            this.HistoryService = HistoryService;

            this.lastEventClick = undefined;
            this.lastEventMove = undefined;
            this.lastNeighboursMove = undefined;
            this.lastPCM = undefined;
            this.curMouseSampleNrInView = undefined;
        };

        $postLink(){
            
            ///////////////
            // bindings

            //
            this.$element.bind('click', (event) => {
                event.preventDefault();
                this.setLastMove(event, true);
                this.setLastClick(event);
            });

            //
            this.$element.bind('contextmenu', (event) => {
                event.preventDefault();
                this.setLastMove(event, true);
                this.setLastRightClick(event);
            });

            //
            this.$element.bind('dblclick', (event) => {
                this.setLastMove(event, true);
                if (this.ConfigProviderService.vals.restrictions.editItemName) {
                    this.setLastDblClick(event);
                } else {
                    this.setLastClick(event);
                }
            });

            //
            this.$element.bind('mousemove', (event) => {
                var moveLine, moveBy;
                if (document.hasFocus()) {
                    if (!this.ViewStateService.getdragBarActive()) {
                        moveLine = true;
                        var samplesPerPixel = this.ViewStateService.getSamplesPerPixelVal(event);
                        this.curMouseSampleNrInView = this.ViewStateService.getX(event) * samplesPerPixel;
                        moveBy = (this.curMouseSampleNrInView - this.lastPCM);
                        if (samplesPerPixel <= 1) {
                            var zoomEventMove = this.LevelService.getClosestItem(this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS, this.level.name, this.SoundHandlerService.audioBuffer.length);
                            // absolute movement in pcm below 1 pcm per pixel
                            if (this.level.type === 'SEGMENT') {
                                if (zoomEventMove.isFirst === true && zoomEventMove.isLast === false) { // before first elem
                                    moveBy = Math.ceil((this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS) - this.LevelService.getItemDetails(this.level.name, 0).sampleStart);
                                } else if (zoomEventMove.isFirst === false && zoomEventMove.isLast === true) { // after last elem
                                    var lastItem = this.LevelService.getLastItem(this.level.name);
                                    moveBy = Math.ceil((this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS) - lastItem.sampleStart - lastItem.sampleDur);
                                } else {
                                    moveBy = Math.ceil((this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS) - this.LevelService.getItemFromLevelById(this.level.name, zoomEventMove.nearest.id).sampleStart);
                                }
                            } else {
                                moveBy = Math.ceil((this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS) - this.LevelService.getItemFromLevelById(this.level.name, zoomEventMove.nearest.id).samplePoint - 0.5); // 0.5 to break between samples not on
                            }
                        } else {
                            // relative movement in pcm above 1 pcm per pixel
                            moveBy = Math.round(this.curMouseSampleNrInView - this.lastPCM);
                        }
                    }

                    var mbutton = 0;
                    if (event.buttons === undefined) {
                        mbutton = event.which;
                    } else {
                        mbutton = event.buttons;
                    }
                    switch (mbutton) {
                        case 1:
                            //console.log('Left mouse button pressed');
                            break;
                        case 2:
                            //console.log('Middle mouse button pressed');
                            break;
                        case 3:
                            //console.log('Right mouse button pressed');
                            break;
                        default:
                            if (!this.ViewStateService.getdragBarActive()) {
                                var curMouseItem = this.ViewStateService.getcurMouseItem();
                                var seg;
                                if (this.ConfigProviderService.vals.restrictions.editItemSize && event.shiftKey) {
                                    this.LevelService.deleteEditArea();
                                    if (curMouseItem !== undefined) {
                                        this.ViewStateService.movingBoundary = true;
                                        if (this.level.type === 'SEGMENT') {
                                            if (this.ViewStateService.getcurMouseisFirst() || this.ViewStateService.getcurMouseisLast()) {
                                                // before first segment
                                                if (this.ViewStateService.getcurMouseisFirst()) {
                                                    seg = this.LevelService.getItemDetails(this.level.name, 0);
                                                    this.ViewStateService.movingBoundarySample = seg.sampleStart + moveBy;
                                                } else if (this.ViewStateService.getcurMouseisLast()) {
                                                    seg = this.LevelService.getLastItem(this.level.name);
                                                    this.ViewStateService.movingBoundarySample = seg.sampleStart + seg.sampleDur + moveBy;
                                                }
                                            } else {
                                                this.ViewStateService.movingBoundarySample = curMouseItem.sampleStart + moveBy;
                                                seg = curMouseItem;
                                            }
                                            this.LevelService.moveBoundary(this.level.name, seg.id, moveBy, this.ViewStateService.getcurMouseisFirst(), this.ViewStateService.getcurMouseisLast());
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'MOVEBOUNDARY',
                                                'name': this.level.name,
                                                'id': seg.id,
                                                'movedBy': moveBy,
                                                'isFirst': this.ViewStateService.getcurMouseisFirst(),
                                                'isLast': this.ViewStateService.getcurMouseisLast()
                                            });

                                        } else {
                                            seg = curMouseItem;
                                            this.ViewStateService.movingBoundarySample = curMouseItem.samplePoint + moveBy;
                                            this.LevelService.moveEvent(this.level.name, seg.id, moveBy);
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'MOVEEVENT',
                                                'name': this.level.name,
                                                'id': seg.id,
                                                'movedBy': moveBy
                                            });
                                        }
                                        this.lastPCM = this.curMouseSampleNrInView;
                                        this.ViewStateService.setLastPcm(this.lastPCM);
                                        this.ViewStateService.selectBoundary();
                                        moveLine = false;
                                    }
                                } else if (this.ConfigProviderService.vals.restrictions.editItemSize && event.altKey) {
                                    this.LevelService.deleteEditArea();
                                    if (this.level.type === 'SEGMENT') {
                                        seg = this.ViewStateService.getcurClickItems();
                                        if (seg[0] !== undefined) {
                                            this.LevelService.moveSegment(this.level.name, seg[0].id, seg.length, moveBy);
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'MOVESEGMENT',
                                                'name': this.level.name,
                                                'id': seg[0].id,
                                                'length': seg.length,
                                                'movedBy': moveBy
                                            });
                                        }
                                        this.lastPCM = this.curMouseSampleNrInView;
                                        this.ViewStateService.setLastPcm(this.lastPCM);
                                        this.ViewStateService.selectBoundary();
                                    }
                                    else if (this.level.type === 'EVENT') {
                                        seg = this.ViewStateService.getcurClickItems();
                                        if (seg[0] !== undefined) {
                                            seg.forEach((s) => {
                                                this.LevelService.moveEvent(this.level.name, s.id, moveBy);
                                                this.HistoryService.updateCurChangeObj({
                                                    'type': 'ANNOT',
                                                    'action': 'MOVEEVENT',
                                                    'name': this.level.name,
                                                    'id': s.id,
                                                    'movedBy': moveBy
                                                });
                                            });
                                        }
                                        this.lastPCM = this.curMouseSampleNrInView;
                                        this.ViewStateService.setLastPcm(this.lastPCM);
                                        this.ViewStateService.selectBoundary();
                                    }
                                } else {
                                    this.ViewStateService.movingBoundary = false;
                                }
                            }
                            break;
                    }
                    if (!this.ViewStateService.getdragBarActive()) {
                        this.setLastMove(event, moveLine);
                    }
                }
            });

            //
            this.$element.bind('mousedown', (event) => {
                this.ViewStateService.movingBoundary = true;
                this.setLastMove(event, true);
            });

            //
            this.$element.bind('mouseup', (event) => {
                this.ViewStateService.movingBoundary = false;
                this.setLastMove(event, true);
            });

            //
            this.$element.bind('mouseout', (event) => {
                this.ViewStateService.movingBoundary = false;
                this.setLastMove(event, true);
            });
        }

               //////////////////////////////////////
        // mouse handling functions
        /**
         *
         */
        private setLastClick (x) {
            this.curMouseSampleNrInView = this.ViewStateService.getX(x) * this.ViewStateService.getSamplesPerPixelVal(x);
            this.LevelService.deleteEditArea();
            this.ViewStateService.setEditing(false);
            this.lastEventClick = this.LevelService.getClosestItem(this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS, this.level.name, this.SoundHandlerService.audioBuffer.length);
            this.ViewStateService.setcurClickLevel(this.level.name, this.level.type, this.idx);
            if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined) {
                this.LevelService.setlasteditArea('_' + this.lastEventClick.current.id);
                this.LevelService.setlasteditAreaElem(this.$element.parent());
                this.ViewStateService.setcurClickItem(this.lastEventClick.current);
                this.ViewStateService.selectBoundary();
            }
            this.lastPCM = this.curMouseSampleNrInView;
            this.ViewStateService.setLastPcm(this.lastPCM);
            this.$scope.$apply();
        };

        /**
         *
         */
        private setLastRightClick (x) {
            if (this.ViewStateService.getcurClickLevelName() !== this.level.name) {
                this.setLastClick(x);
            }
            this.curMouseSampleNrInView = this.ViewStateService.getX(x) * this.ViewStateService.getSamplesPerPixelVal(x);
            this.LevelService.deleteEditArea();
            this.lastEventClick = this.LevelService.getClosestItem(this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS, this.level.name, this.SoundHandlerService.audioBuffer.length);
            if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined) {
                var next = this.LevelService.getItemInTime(this.ViewStateService.getcurClickLevelName(), this.lastEventClick.current.id, true);
                var prev = this.LevelService.getItemInTime(this.ViewStateService.getcurClickLevelName(), this.lastEventClick.current.id, false);
                this.ViewStateService.setcurClickLevel(this.level.name, this.level.type, this.idx);
                this.ViewStateService.setcurClickItemMultiple(this.lastEventClick.current, next, prev);
                this.ViewStateService.selectBoundary();
            }
            this.lastPCM = this.curMouseSampleNrInView;
            this.ViewStateService.setLastPcm(this.lastPCM);
            this.$scope.$apply();
        };

        /**
         *
         */
        private setLastDblClick (x) {
            this.curMouseSampleNrInView = this.ViewStateService.getX(x) * this.ViewStateService.getSamplesPerPixelVal(x);
            this.lastEventClick = this.LevelService.getClosestItem(this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS, this.level.name, this.SoundHandlerService.audioBuffer.length);
            var isOpen = this.$element.parent().css('height') === '25px' ? false : true;
            // expand to full size on dbl click if level is in small size
            if (!isOpen) {
                this.$element.parent().parent().find('div')[3].click();
            }
            if (this.lastEventClick.current !== undefined && this.lastEventClick.nearest !== undefined && this.ViewStateService.getPermission('labelAction')) {
                if (this.level.type === 'SEGMENT') {
                    if (this.lastEventClick.current.sampleStart >= this.ViewStateService.curViewPort.sS) {
                        if ((this.lastEventClick.current.sampleStart + this.lastEventClick.current.sampleDur) <= this.ViewStateService.curViewPort.eS) {
                            this.ViewStateService.setcurClickLevel(this.level.name, this.level.type, this.idx);
                            this.ViewStateService.setcurClickItem(this.lastEventClick.current);
                            this.LevelService.setlasteditArea('_' + this.lastEventClick.current.id);
                            this.LevelService.setlasteditAreaElem(this.$element.parent());
                            this.ViewStateService.setEditing(true);
                            this.LevelService.openEditArea(this.lastEventClick.current, this.$element.parent(), this.level.type);
                        } else {
                            //console.log('Editing out of right bound !');
                        }
                    } else {
                        //console.log('Editing out of left bound !');
                    }
                } else {
                    this.ViewStateService.setcurClickLevel(this.level.name, this.level.type, this.idx);
                    this.ViewStateService.setcurClickItem(this.lastEventClick.current);
                    this.LevelService.setlasteditArea('_' + this.lastEventClick.current.id);
                    this.LevelService.setlasteditAreaElem(this.$element.parent());
                    this.ViewStateService.setEditing(true);
                    this.LevelService.openEditArea(this.lastEventClick.current, this.$element.parent(), this.level.type);
                    this.ViewStateService.setEditing(true);
                }
            }
            this.lastPCM = this.curMouseSampleNrInView;
            this.ViewStateService.setLastPcm(this.lastPCM);
            this.$scope.$apply();
        };

        /**
         *
         */
        private setLastMove (x, doChange) {
            this.curMouseSampleNrInView = this.ViewStateService.getX(x) * this.ViewStateService.getSamplesPerPixelVal(x);
            this.lastEventMove = this.LevelService.getClosestItem(this.curMouseSampleNrInView + this.ViewStateService.curViewPort.sS, this.level.name, this.SoundHandlerService.audioBuffer.length);
            if (doChange) {
                if (this.lastEventMove.current !== undefined && this.lastEventMove.nearest !== undefined) {
                    this.lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.level.name, this.lastEventMove.nearest.id, this.lastEventMove.nearest.id);
                    this.ViewStateService.setcurMouseItem(this.lastEventMove.nearest, this.lastNeighboursMove, this.ViewStateService.getX(x), this.lastEventMove.isFirst, this.lastEventMove.isLast);
                }
            }
            this.ViewStateService.setcurMouseLevelName(this.level.name);
            this.ViewStateService.setcurMouseLevelType(this.level.type);
            this.lastPCM = this.curMouseSampleNrInView;
            this.ViewStateService.setLastPcm(this.lastPCM);
            this.$scope.$apply();
        };
    }]

}
angular.module('emuwebApp')
.component(LevelCanvasMarkupCanvasComponent.selector, LevelCanvasMarkupCanvasComponent);
