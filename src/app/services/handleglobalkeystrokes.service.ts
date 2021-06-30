import * as angular from 'angular';

import styles from '../../styles/EMUwebAppDesign.scss';

class HandleGlobalKeyStrokes{

    private $rootScope;
    private $timeout;
    private ViewStateService;
    private ModalService;
    private HierarchyManipulationService;
    private SoundHandlerService;
    private ConfigProviderService;
    private HistoryService;
    private LevelService;
    private DataService;
    private LinkService;
    private AnagestService;
    private DbObjLoadSaveService;
    private BrowserDetectorService;

    constructor(
        $rootScope,
        $timeout, 
        ViewStateService, 
        ModalService, 
        HierarchyManipulationService, 
        SoundHandlerService, 
        ConfigProviderService, 
        HistoryService, 
        LevelService, 
        DataService, 
        LinkService, 
        AnagestService, 
        DbObjLoadSaveService,
        BrowserDetectorService
        ){
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.ViewStateService = ViewStateService;
            this.ModalService = ModalService;
            this.HierarchyManipulationService = HierarchyManipulationService;
            this.SoundHandlerService = SoundHandlerService;
            this.ConfigProviderService = ConfigProviderService;
            this.HistoryService = HistoryService;
            this.LevelService = LevelService;
            this.DataService = DataService;
            this.LinkService = LinkService;
            this.AnagestService = AnagestService;
            this.DbObjLoadSaveService = DbObjLoadSaveService;
            this.BrowserDetectorService = BrowserDetectorService;

    }
    /**
     * function called by emu-webapp.component that sets up keyboard bindings
     * to document
     */
    public bindGlobalKeys (){
        $(document).on('keyup', (e) => {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (this.ViewStateService.isEditing() && !this.ViewStateService.getcursorInTextField()) {
                this.applyKeyCodeUp(code);
            }
        });

        $(document).on('keydown', (e) => {
            // if (!this.BrowserDetectorService.isBrowser.Firefox()) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code === 8 || code === 9 || code === 27 || code === 37 || code === 38 || code === 39 || code === 40 || code === 32) {
                    this.applyKeyCode(code, e);
                }
            // }
        });

        $(document).on('keypress', (e) => {
            var code = (e.keyCode ? e.keyCode : e.which);
            this.applyKeyCode(code, e);
        });
    }

    private applyKeyCodeUp (code) {
        this.$rootScope.$apply(() => {
            if (code !== this.ConfigProviderService.vals.keyMappings.esc && code !== this.ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                var domElement = $('.' + this.LevelService.getlasteditArea()) as any;
                var str = domElement.val();
                this.ViewStateService.setSavingAllowed(true);
                var curAttrIndex = this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName());
                var lvlDefs = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName());
                var definitions = {} as any;
                if (lvlDefs.attributeDefinitions !== undefined && lvlDefs.attributeDefinitions.length > 0) {
                    definitions = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).attributeDefinitions[curAttrIndex];
                }
                // if it is defined then check if characters are ok
                if (definitions.legalLabels !== undefined && str.length > 0) {
                    if (definitions.legalLabels.indexOf(str) < 0) {
                        this.ViewStateService.setSavingAllowed(false);
                    }
                }
                if (this.ViewStateService.isSavingAllowed()) {
                    domElement.css({
                        'background-color': 'rgba(255,255,0,1)'
                    });
                } else {
                    domElement.css({
                        'background-color': 'rgba(255,0,0,1)'
                    });
                }
            }
        });
    };

    private applyKeyCode (code, e) {
        this.$rootScope.$apply(() => {
            // check if mouse has to be in labeler for key mappings
            if (this.ConfigProviderService.vals.main.catchMouseForKeyBinding) {
                if (!this.ViewStateService.mouseInEmuWebApp) {
                    return;
                }
            }
            this.ViewStateService.setlastKeyCode(code);

            var attrIndex, newValue, oldValue, levelName, levelType, neighbor, minDist, mouseSeg;
            var lastNeighboursMove, neighbours, seg, insSeg, lastEventMove, deletedSegment, deletedLinks;

            // Handle key strokes for the hierarchy modal
            if (this.ViewStateService.hierarchyState.isShown() && this.ViewStateService.hierarchyState !== undefined) {
                if (this.ViewStateService.hierarchyState.getInputFocus()) {
                    // Commit label change
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyCommitEdit) {
                        var elementID = this.ViewStateService.hierarchyState.getContextMenuID();
                        var element = this.LevelService.getItemByID(elementID);
                        levelName = this.LevelService.getLevelName(elementID);
                        attrIndex = this.ViewStateService.getCurAttrIndex(levelName);
                        var legalLabels = this.ConfigProviderService.getLevelDefinition(levelName).attributeDefinitions[attrIndex].legalLabels;
                        newValue = this.ViewStateService.hierarchyState.getEditValue();
                        if (element.labels[attrIndex] !== undefined) {
                            oldValue = element.labels[attrIndex].value;
                        } else {
                            oldValue = '';
                        }
                        if (newValue !== undefined && newValue !== oldValue) {
                            // Check if new value is legal
                            if (legalLabels === undefined || (newValue.length > 0 && legalLabels.indexOf(newValue) >= 0)) {
                                this.LevelService.renameLabel(levelName, elementID, attrIndex, newValue);
                                this.HistoryService.addObjToUndoStack({
                                    // Re-Using the already existing ANNOT/RENAMELABEL
                                    // I could also define HIERARCHY/RENAMELABEL for keeping the logical structure,
                                    // but it would have the same code
                                    'type': 'ANNOT',
                                    'action': 'RENAMELABEL',
                                    'name': levelName,
                                    'id': elementID,
                                    'attrIndex': attrIndex,
                                    'oldValue': oldValue,
                                    'newValue': newValue
                                });
                                this.ViewStateService.hierarchyState.closeContextMenu();
                            }
                        } else {
                            this.ViewStateService.hierarchyState.closeContextMenu();
                        }
                    }
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyCancelEdit) {
                        this.ViewStateService.hierarchyState.closeContextMenu();
                    }
                } else {
                    //if (!e.metaKey && !e.ctrlKey) {
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyDeleteLink) {
                        e.preventDefault();
                    }

                    // Play selected item
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyPlayback) {
                        e.preventDefault();
                        this.ViewStateService.hierarchyState.playing += 1;
                        // console.log('hierarchyPlayback');
                    }

                    // rotateHierarchy
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyRotate) {
                        this.ViewStateService.hierarchyState.toggleRotation();
                    }

                    // Delete link
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyDeleteLink) {
                        /*
                         This block is currently obsoleted because e.preventDefault() is called above
                         at the beginning of the hierarchy block
                         // This should only be called when certain keys are pressed that are known to trigger some browser behaviour.
                         // But what if the key code is reconfigured (possibly by the user)?
                         e.preventDefault();
                         */

                        var pos = this.LinkService.deleteLink(this.ViewStateService.hierarchyState.selectedLinkFromID, this.ViewStateService.hierarchyState.selectedLinkToID);

                        if (pos !== -1) {
                            this.HistoryService.addObjToUndoStack({
                                type: 'HIERARCHY',
                                action: 'DELETELINK',
                                fromID: this.ViewStateService.hierarchyState.selectedLinkFromID,
                                toID: this.ViewStateService.hierarchyState.selectedLinkToID,
                                position: pos
                            });
                        }
                    }

                    // Delete item
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyDeleteItem) {
                        var result = this.LevelService.deleteItemWithLinks(this.ViewStateService.hierarchyState.selectedItemID);

                        if (result.item !== undefined) {
                            this.HistoryService.addObjToUndoStack({
                                type: 'HIERARCHY',
                                action: 'DELETEITEM',
                                item: result.item,
                                levelName: result.levelName,
                                position: result.position,
                                deletedLinks: result.deletedLinks
                            });
                        }
                    }

                    // Add item ...
                    // ... before the currently selected one
                    var newID;
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyAddItemBefore) {
                        newID = this.LevelService.addItem(this.ViewStateService.hierarchyState.selectedItemID, true);

                        if (newID !== -1) {
                            this.HistoryService.addObjToUndoStack({
                                type: 'HIERARCHY',
                                action: 'ADDITEM',
                                newID: newID,
                                neighborID: this.ViewStateService.hierarchyState.selectedItemID,
                                before: true
                            });
                        }
                    }
                    // ... after the currently selected one
                    if (code === this.ConfigProviderService.vals.keyMappings.hierarchyAddItemAfter) {
                        newID = this.LevelService.addItem(this.ViewStateService.hierarchyState.selectedItemID, false);

                        if (newID !== -1) {
                            this.HistoryService.addObjToUndoStack({
                                type: 'HIERARCHY',
                                action: 'ADDITEM',
                                newID: newID,
                                neighborID: this.ViewStateService.hierarchyState.selectedItemID,
                                before: false
                            });
                        }
                    }

                    /* Add link
                     if (code === ConfigProviderService.vals.keyMappings.hierarchyAddLink) {
                     if (ViewStateService.hierarchyState.newLinkFromID === undefined) {
                     ViewStateService.hierarchyState.newLinkFromID = ViewStateService.hierarchyState.selectedItemID;
                     } else {
                     var linkObj = HierarchyManipulationService.addLink(ViewStateService.hierarchyState.path, ViewStateService.hierarchyState.newLinkFromID, ViewStateService.hierarchyState.selectedItemID);
                     ViewStateService.hierarchyState.newLinkFromID = undefined;
                     if (linkObj !== null) {
                     HistoryService.addObjToUndoStack({
                     type: 'HIERARCHY',
                     action: 'ADDLINK',
                     link: linkObj
                     });
                     }
                     }
                     }*/

                    // levelUp
                    if (code === this.ConfigProviderService.vals.keyMappings.levelUp){
                        // console.log("prevPath");
                        if(this.ViewStateService.hierarchyState.curPathIdx >= 1) {
                            this.ViewStateService.hierarchyState.curPathIdx = this.ViewStateService.hierarchyState.curPathIdx - 1;
                        }
                    }
                    
                    // levelDown
                    if (code === this.ConfigProviderService.vals.keyMappings.levelDown){
                        // console.log("nextPath");
                        if(this.ViewStateService.hierarchyState.curPathIdx < this.ViewStateService.hierarchyState.curNrOfPaths - 1){
                            this.ViewStateService.hierarchyState.curPathIdx = this.ViewStateService.hierarchyState.curPathIdx + 1;
                        }
                    }


                    // undo
                    if (code === this.ConfigProviderService.vals.keyMappings.undo) {
                        this.HistoryService.undo();
                    }

                    // redo
                    if (code === this.ConfigProviderService.vals.keyMappings.redo) {
                        this.HistoryService.redo();
                    }

                    // close modal
                    if (!e.shiftKey && (code === this.ConfigProviderService.vals.keyMappings.esc || code === this.ConfigProviderService.vals.keyMappings.showHierarchy)) {
                        this.ModalService.close();
                    }
                }
            } else if (this.ViewStateService.isEditing()) {
                var domElement = $('.' + this.LevelService.getlasteditArea());
                // preventing new line if saving not allowed
                if (!this.ViewStateService.isSavingAllowed() && code === this.ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                    var definitions = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName()).attributeDefinitions[this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName())].legalLabels;
                    e.preventDefault();
                    e.stopPropagation();
                    this.LevelService.deleteEditArea();
                    this.ViewStateService.setEditing(false);
                    this.ModalService.open('views/error.html', 'Editing Error: Sorry, characters allowed on this Level are "' + JSON.stringify(definitions) + '"');
                }
                // save text on enter if saving is allowed
                if (this.ViewStateService.isSavingAllowed() && code === this.ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                    var editingElement = this.LevelService.getItemFromLevelById(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID());
                    attrIndex = this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName());
                    oldValue = '';
                    newValue = '';
                    if (editingElement.labels[attrIndex] !== undefined) {
                        oldValue = editingElement.labels[attrIndex].value;
                    }
                    // get new value from dom element or from ViewStateService.largeTextFieldInputFieldCurLabel if it is used
                    if(this.ConfigProviderService.vals.restrictions.useLargeTextInputField){
                        newValue = this.ViewStateService.largeTextFieldInputFieldCurLabel;
                    }else{
                        newValue = domElement.val();
                    }

                    this.LevelService.renameLabel(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID(), this.ViewStateService.getCurAttrIndex(this.ViewStateService.getcurClickLevelName()), newValue);
                    this.HistoryService.addObjToUndoStack({
                        'type': 'ANNOT',
                        'action': 'RENAMELABEL',
                        'name': this.ViewStateService.getcurClickLevelName(),
                        'id': this.LevelService.getlastID(),
                        'attrIndex': attrIndex,
                        'oldValue': oldValue,
                        'newValue': newValue
                    });
                    this.LevelService.deleteEditArea();
                    this.ViewStateService.setEditing(false);
                    this.ViewStateService.setcurClickItem(this.LevelService.getItemFromLevelById(this.ViewStateService.getcurClickLevelName(), this.LevelService.getlastID()));
                }
                // escape from text if esc
                if (code === this.ConfigProviderService.vals.keyMappings.esc) {
                    this.LevelService.deleteEditArea();
                    this.ViewStateService.setEditing(false);
                }
                
                // playAllInView
                if (code === this.ConfigProviderService.vals.keyMappings.playAllInView && e.altKey) {
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                            this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                        }
                    }
                }

                // playSelected
                if (code === 3 && e.altKey) { // ConfigProviderService.vals.keyMappings.playSelected
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                            this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                        }
                    }
                }

                // playEntireFile
                if (code === this.ConfigProviderService.vals.keyMappings.playEntireFile && e.altKey) {
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            this.SoundHandlerService.playFromTo(0, this.SoundHandlerService.audioBuffer.length);
                            this.ViewStateService.animatePlayHead(0, this.SoundHandlerService.audioBuffer.length);
                        }
                    }
                }


            } else if (this.ViewStateService.getcursorInTextField() === false) {

                this.LevelService.deleteEditArea();


                // escape from open modal dialog
                //
                if (this.ViewStateService.curState.permittedActions.length === 0 &&
                    code === this.ConfigProviderService.vals.keyMappings.esc &&
                    this.ModalService.force === false) {
                    this.ModalService.close();
                }


                // delegate keyboard keyMappings according to keyMappings of scope
                // showHierarchy
                if (code === this.ConfigProviderService.vals.keyMappings.showHierarchy && this.ConfigProviderService.vals.activeButtons.showHierarchy) {
                    if (this.ViewStateService.curState !== this.ViewStateService.states.noDBorFilesloaded) {
                        if (this.ViewStateService.hierarchyState.isShown()) {
                            this.ModalService.close();
                        } else {
                            this.ViewStateService.hierarchyState.toggleHierarchy();
                            this.ModalService.open('views/showHierarchyModal.html');
                        }
                    }
                }

                // zoomAll
                if (code === this.ConfigProviderService.vals.keyMappings.zoomAll) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.setViewPort(0, this.SoundHandlerService.audioBuffer.length);
                    } else {
                        //console.log('zoom all action currently not allowed');
                    }
                }

                // zoomIn
                if (code === this.ConfigProviderService.vals.keyMappings.zoomIn) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.zoomViewPort(true, this.LevelService);
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // zoomOut
                if (code === this.ConfigProviderService.vals.keyMappings.zoomOut) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.zoomViewPort(false, this.LevelService);
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // zoomSel
                if (code === this.ConfigProviderService.vals.keyMappings.zoomSel) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.setViewPort(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // shiftViewPortLeft
                if (code === this.ConfigProviderService.vals.keyMappings.shiftViewPortLeft) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.shiftViewPort(false);
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // shiftViewPortRight
                if (code === this.ConfigProviderService.vals.keyMappings.shiftViewPortRight) {
                    if (this.ViewStateService.getPermission('zoom')) {
                        this.ViewStateService.shiftViewPort(true);
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // playEntireFile
                if (code === this.ConfigProviderService.vals.keyMappings.playEntireFile) {
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            this.SoundHandlerService.playFromTo(0, this.SoundHandlerService.audioBuffer.length);
                            this.ViewStateService.animatePlayHead(0, this.SoundHandlerService.audioBuffer.length);
                        }
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // playAllInView
                if (code === this.ConfigProviderService.vals.keyMappings.playAllInView) {
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            if(!e.shiftKey){
                                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.ViewStateService.curViewPort.eS);
                            }else{
                                // playAllInView to end of file and autoscroll
                                this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.sS, this.SoundHandlerService.audioBuffer.length);
                                this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.sS, this.SoundHandlerService.audioBuffer.length, true);
                            }


                        }
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // playSelected
                if (code === this.ConfigProviderService.vals.keyMappings.playSelected) {
                    if (this.ViewStateService.getPermission('playaudio')) {
                        if (this.ConfigProviderService.vals.restrictions.playback) {
                            this.SoundHandlerService.playFromTo(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                            this.ViewStateService.animatePlayHead(this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE);
                        }
                    } else {
                        //console.log('action currently not allowed');
                    }
                }

                // save bundle
                if (code === this.ConfigProviderService.vals.keyMappings.saveBndl) {
                    if (this.ViewStateService.getPermission('saveBndlBtnClick')) {
                        this.DbObjLoadSaveService.saveBundle();
                    }
                }


                // selectFirstContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectFirstContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = 1;
                        }
                    }
                }

                // selectSecondContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectSecondContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = 2;
                        }
                    }
                }
                // selectThirdContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectThirdContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = 3;
                        }
                    }
                }
                // selectFourthContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectFourthContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = 4;
                        }
                    }
                }
                // selectFourthContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectFifthContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = 5;
                        }
                    }
                }
                // selectNOContourCorrectionTool
                if (code === this.ConfigProviderService.vals.keyMappings.selectNoContourCorrectionTool) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.correctionTool) {
                            this.ViewStateService.curCorrectionToolNr = undefined;
                        }
                    }
                }
                // levelUp
                if (code === this.ConfigProviderService.vals.keyMappings.levelUp) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        this.ViewStateService.selectLevel(false, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService); // pass in LevelService to prevent circular deps
                    }
                }
                // levelDown
                if (code === this.ConfigProviderService.vals.keyMappings.levelDown) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        this.ViewStateService.selectLevel(true, this.ConfigProviderService.vals.perspectives[this.ViewStateService.curPerspectiveIdx].levelCanvases.order, this.LevelService); // pass LevelService to prevent circular deps
                    }
                }

                // preselected boundary snap to top
                if (code === this.ConfigProviderService.vals.keyMappings.snapBoundaryToNearestTopBoundary) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            mouseSeg = this.ViewStateService.getcurMouseItem();
                            levelName = this.ViewStateService.getcurMouseLevelName();
                            levelType = this.ViewStateService.getcurMouseLevelType();
                            neighbor = this.ViewStateService.getcurMouseNeighbours();
                            minDist = this.LevelService.snapBoundary(true, levelName, mouseSeg, neighbor, levelType);
                            if (minDist === false) {
                                // error msg nothing moved / nothing on top
                            } else {
                                if (levelType === 'EVENT') {
                                    this.HistoryService.updateCurChangeObj({
                                        'type': 'ANNOT',
                                        'action': 'MOVEEVENT',
                                        'name': levelName,
                                        'id': mouseSeg.id,
                                        'movedBy': minDist
                                    });
                                } else if (levelType === 'SEGMENT') {
                                    this.HistoryService.updateCurChangeObj({
                                        'type': 'ANNOT',
                                        'action': 'MOVEBOUNDARY',
                                        'name': levelName,
                                        'id': mouseSeg.id,
                                        'movedBy': minDist,
                                        'position': 0
                                    });
                                }
                                this.HistoryService.addCurChangeObjToUndoStack();
                            }
                        }
                    }
                }

                // preselected boundary snap to bottom
                if (code === this.ConfigProviderService.vals.keyMappings.snapBoundaryToNearestBottomBoundary) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            mouseSeg = this.ViewStateService.getcurMouseItem();
                            levelName = this.ViewStateService.getcurMouseLevelName();
                            levelType = this.ViewStateService.getcurMouseLevelType();
                            neighbor = this.ViewStateService.getcurMouseNeighbours();
                            minDist = this.LevelService.snapBoundary(false, levelName, mouseSeg, neighbor, levelType);
                            if (minDist === false) {
                                // error msg nothing moved / nothing below
                            } else {
                                if (levelType === 'EVENT') {
                                    this.HistoryService.updateCurChangeObj({
                                        'type': 'ANNOT',
                                        'action': 'MOVEEVENT',
                                        'name': levelName,
                                        'id': mouseSeg.id,
                                        'movedBy': minDist
                                    });
                                } else if (levelType === 'SEGMENT') {
                                    this.HistoryService.updateCurChangeObj({
                                        'type': 'ANNOT',
                                        'action': 'MOVEBOUNDARY',
                                        'name': levelName,
                                        'id': mouseSeg.id,
                                        'movedBy': minDist,
                                        'position': 0
                                    });
                                }
                                this.HistoryService.addCurChangeObjToUndoStack();
                            }
                        }
                    }
                }

                // preselected boundary to nearest zero crossing
                if (code === this.ConfigProviderService.vals.keyMappings.snapBoundaryToNearestZeroCrossing) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            var dist;
                            var action;
                            if (this.ViewStateService.getcurMouseLevelType() === 'SEGMENT') {
                                if(!this.ViewStateService.getcurMouseisLast()){
                                    dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().sampleStart);
                                } else {
                                    dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().sampleStart + this.ViewStateService.getcurMouseItem().sampleDur + 1);	
                                }
                            } else {
                                dist = this.LevelService.calcDistanceToNearestZeroCrossing(this.ViewStateService.getcurMouseItem().samplePoint);
                            }
                            if (dist !== 0) {
                                seg = this.ViewStateService.getcurMouseItem();
                                levelName = this.ViewStateService.getcurMouseLevelName();
                                levelType = this.ViewStateService.getcurMouseLevelType();
                                if(levelType == 'SEGMENT'){
                                    this.LevelService.moveBoundary(levelName, seg.id, dist, this.ViewStateService.getcurMouseisFirst(), this.ViewStateService.getcurMouseisLast());
                                    action = 'MOVEBOUNDARY';
                                } else {
                                    this.LevelService.moveEvent(levelName, seg.id, dist);
                                    action = 'MOVEEVENT';
                                }

                                this.HistoryService.updateCurChangeObj({
                                    'type': 'ANNOT',
                                    'action': action,
                                    'name': levelName,
                                    'id': seg.id,
                                    'movedBy': dist,
                                    'isFirst': this.ViewStateService.getcurMouseisFirst(),
                                    'isLast': this.ViewStateService.getcurMouseisLast()
                                });

                                this.HistoryService.addCurChangeObjToUndoStack();
                            }
                        }
                    }
                }

                var changeTime;
                // expand Segments
                if (code === this.ConfigProviderService.vals.keyMappings.expandSelSegmentsRight) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            if (this.ViewStateService.getcurClickLevelName() === undefined) {
                                this.ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
                            } else {
                                if (this.ViewStateService.getselected().length === 0) {
                                    this.ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
                                } else {
                                    changeTime = parseInt(this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                                    if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                                        changeTime = this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (this.SoundHandlerService.audioBuffer.length / 100);
                                    }
                                    this.LevelService.expandSegment(true, this.ViewStateService.getcurClickItems(), this.ViewStateService.getcurClickLevelName(), changeTime);
                                    this.HistoryService.addObjToUndoStack({
                                        'type': 'ANNOT',
                                        'action': 'EXPANDSEGMENTS',
                                        'name': this.ViewStateService.getcurClickLevelName(),
                                        'item': this.ViewStateService.getcurClickItems(),
                                        'rightSide': true,
                                        'changeTime': changeTime
                                    });
                                    this.ViewStateService.selectBoundary();
                                }
                            }
                        }
                    }
                }

                // expand Segment left
                if (code === this.ConfigProviderService.vals.keyMappings.expandSelSegmentsLeft) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            if (this.ViewStateService.getcurClickLevelName() === undefined) {
                                this.ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
                            } else {
                                if (this.ViewStateService.getselected().length === 0) {
                                    this.ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
                                } else {
                                    if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                                        changeTime = parseInt(this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                                    } else if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                                        changeTime = this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (this.SoundHandlerService.audioBuffer.length / 100);
                                    } else {
                                        this.ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                                    }
                                    this.LevelService.expandSegment(false, this.ViewStateService.getcurClickItems(), this.ViewStateService.getcurClickLevelName(), changeTime);
                                    this.HistoryService.addObjToUndoStack({
                                        'type': 'ANNOT',
                                        'action': 'EXPANDSEGMENTS',
                                        'name': this.ViewStateService.getcurClickLevelName(),
                                        'item': this.ViewStateService.getcurClickItems(),
                                        'rightSide': false,
                                        'changeTime': changeTime
                                    });
                                    this.ViewStateService.selectBoundary();
                                }
                            }
                        }
                    }
                }

                // shrink Segments Left
                if (code === this.ConfigProviderService.vals.keyMappings.shrinkSelSegmentsLeft) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            if (this.ViewStateService.getcurClickLevelName() === undefined) {
                                this.ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
                            } else {
                                if (this.ViewStateService.getselected().length === 0) {
                                    this.ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
                                } else {
                                    if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                                        changeTime = parseInt(this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                                    } else if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                                        changeTime = this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (this.SoundHandlerService.audioBuffer.length / 100);
                                    } else {
                                        this.ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                                    }
                                    this.LevelService.expandSegment(true, this.ViewStateService.getcurClickItems(), this.ViewStateService.getcurClickLevelName(), -changeTime);
                                    this.HistoryService.addObjToUndoStack({
                                        'type': 'ANNOT',
                                        'action': 'EXPANDSEGMENTS',
                                        'name': this.ViewStateService.getcurClickLevelName(),
                                        'item': this.ViewStateService.getcurClickItems(),
                                        'rightSide': true,
                                        'changeTime': -changeTime
                                    });
                                    this.ViewStateService.selectBoundary();
                                }
                            }
                        }
                    }
                }


                // shrink Segments Right
                if (code === this.ConfigProviderService.vals.keyMappings.shrinkSelSegmentsRight) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ConfigProviderService.vals.restrictions.editItemSize) {
                            if (this.ViewStateService.getcurClickLevelName() === undefined) {
                                this.ModalService.open('views/error.html', 'Expand Segments Error: Please select a Level first');
                            } else {
                                if (this.ViewStateService.getselected().length === 0) {
                                    this.ModalService.open('views/error.html', 'Expand Segments Error: Please select one or more Segments first');
                                } else {
                                    if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'absolute') {
                                        changeTime = parseInt(this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue, 10);
                                    } else if (this.ConfigProviderService.vals.labelCanvasConfig.addTimeMode === 'relative') {
                                        changeTime = this.ConfigProviderService.vals.labelCanvasConfig.addTimeValue * (this.SoundHandlerService.audioBuffer.length / 100);
                                    } else {
                                        this.ModalService.open('views/error.html', 'Expand Segements Error: Error in Configuration (Value labelCanvasConfig.addTimeMode)');
                                    }
                                    this.LevelService.expandSegment(false, this.ViewStateService.getcurClickItems(), this.ViewStateService.getcurClickLevelName(), -changeTime);
                                    this.HistoryService.addObjToUndoStack({
                                        'type': 'ANNOT',
                                        'action': 'EXPANDSEGMENTS',
                                        'name': this.ViewStateService.getcurClickLevelName(),
                                        'item': this.ViewStateService.getcurClickItems(),
                                        'rightSide': false,
                                        'changeTime': -changeTime
                                    });
                                    this.ViewStateService.selectBoundary();
                                }
                            }
                        }
                    }
                }


                // toggleSideBars
                if (code === this.ConfigProviderService.vals.keyMappings.toggleSideBarLeft) {
                    if (this.ViewStateService.getPermission('toggleSideBars')) {
                        // check if menu button in showing -> if not -> no submenu open
                        if (this.ConfigProviderService.vals.activeButtons.openMenu) {
                            this.ViewStateService.toggleBundleListSideBar(styles.animationPeriod);
                        }
                    }
                }

                // toggleSideBars
                if (code === this.ConfigProviderService.vals.keyMappings.toggleSideBarRight) {
                    if (this.ViewStateService.getPermission('toggleSideBars')) {
                        // check if menu button in showing -> if not -> no submenu open
                        if (this.ConfigProviderService.vals.activeButtons.openMenu) {
                            this.ViewStateService.setPerspectivesSideBarOpen(!this.ViewStateService.getPerspectivesSideBarOpen());
                        }
                    }
                }

                // select Segments in viewport selection
                if (code === this.ConfigProviderService.vals.keyMappings.selectItemsInSelection) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ViewStateService.getcurClickLevelName() === undefined) {
                            this.ModalService.open('views/error.html', 'Selection Error : Please select a Level first');
                        } else {
                            this.ViewStateService.curClickItems = [];
                            var prev = null;
                            this.ViewStateService.getItemsInSelection(this.DataService.data.levels).forEach((item) => {
                                if(prev === null) {
                                    this.ViewStateService.setcurClickItem(item);
                                }
                                else {
                                    this.ViewStateService.setcurClickItemMultiple(item, prev);
                                }
                                prev = item;
                            });
                            this.ViewStateService.selectBoundary();
                        }
                    }
                }

                // selPrevItem (arrow key left)
                if (code === this.ConfigProviderService.vals.keyMappings.selPrevItem) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ViewStateService.getcurClickItems().length > 0) {
                            lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.getcurClickItems()[0].id, this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id);
                            neighbours = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), lastNeighboursMove.left.id, lastNeighboursMove.left.id);
                            if (lastNeighboursMove.left !== undefined) {
                                if (lastNeighboursMove.left.sampleStart !== undefined) {
                                    // check if in view
                                    if (lastNeighboursMove.left.sampleStart > this.ViewStateService.curViewPort.sS) {
                                        if (e.shiftKey) { // select multiple while shift
                                            this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        } else {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.left);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        }
                                        this.ViewStateService.selectBoundary();
                                    }
                                } else {
                                    // check if in view
                                    if (lastNeighboursMove.left.samplePoint > this.ViewStateService.curViewPort.sS) {
                                        if (e.shiftKey) { // select multiple while shift
                                            this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.left, neighbours.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        } else {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.left);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        }
                                        this.ViewStateService.selectBoundary();
                                    }
                                }
                            }
                        }
                    }
                }

                

                // selNextItem (arrow key right)
                if (code === this.ConfigProviderService.vals.keyMappings.selNextItem) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ViewStateService.getcurClickItems().length > 0) {
                            lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.getcurClickItems()[0].id, this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id);
                            neighbours = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), lastNeighboursMove.right.id, lastNeighboursMove.right.id);
                            if (lastNeighboursMove.right !== undefined) {
                                if (lastNeighboursMove.right.sampleStart !== undefined) {
                                    // check if in view
                                    if (lastNeighboursMove.right.sampleStart +  lastNeighboursMove.right.sampleDur < this.ViewStateService.curViewPort.eS) {
                                        if (e.shiftKey) { // select multiple while shift
                                            this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        } else {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        }
                                        this.ViewStateService.selectBoundary();
                                    }
                                } else {
                                    // check if in view
                                    if (lastNeighboursMove.right.samplePoint < this.ViewStateService.curViewPort.eS) {
                                        if (e.shiftKey) { // select multiple while shift
                                            this.ViewStateService.setcurClickItemMultiple(lastNeighboursMove.right, neighbours.left);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        } else {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        }
                                        this.ViewStateService.selectBoundary();
                                    }
                                }
                            }
                        }
                    }
                }

                // selNextPrevItem (tab key and tab+shift key)
                if (code === this.ConfigProviderService.vals.keyMappings.selNextPrevItem) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        if (this.ViewStateService.getcurClickItems().length > 0) {
                            var idLeft = this.ViewStateService.getcurClickItems()[0].id;
                            var idRight = this.ViewStateService.getcurClickItems()[this.ViewStateService.getcurClickItems().length - 1].id;
                            lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(this.ViewStateService.getcurClickLevelName(), idLeft, idRight);
                            if (e.shiftKey) {
                                if (lastNeighboursMove.left !== undefined) {
                                    if (lastNeighboursMove.left.sampleStart !== undefined) {
                                        // check if in view
                                        if (lastNeighboursMove.left.sampleStart >= this.ViewStateService.curViewPort.sS) {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.left);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        }
                                    } else {
                                        // check if in view
                                        if (lastNeighboursMove.left.samplePoint >= this.ViewStateService.curViewPort.sS) {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.left, lastNeighboursMove.left.id);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.left.id);
                                        }
                                    }
                                }
                            } else {
                                if (lastNeighboursMove.right !== undefined) {
                                    if (lastNeighboursMove.right.sampleStart !== undefined) {
                                        // check if in view
                                        if (lastNeighboursMove.right.sampleStart + lastNeighboursMove.right.sampleDur <= this.ViewStateService.curViewPort.eS) {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        }
                                    } else {
                                        // check if in view
                                        if (lastNeighboursMove.right.samplePoint < this.ViewStateService.curViewPort.eS) {
                                            this.ViewStateService.setcurClickItem(lastNeighboursMove.right);
                                            this.LevelService.setlasteditArea('_' + lastNeighboursMove.right.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // createNewItemAtSelection
                if (code === this.ConfigProviderService.vals.keyMappings.createNewItemAtSelection) {
                    // auto action in model when open and user presses 'enter'
                    if (this.ModalService.isOpen) {
                        if(this.ModalService.force === false){
                            this.ModalService.confirmContent();
                        }
                    }
                    else {
                        if (this.ViewStateService.curClickLevelIndex === undefined) {
                            this.ModalService.open('views/error.html', 'Modify Error: Please select a Segment or Event Level first.');
                        }
                        else {
                            if (this.ViewStateService.getPermission('labelAction')) {
                                if (this.ConfigProviderService.vals.restrictions.addItem) {
                                    if (this.ViewStateService.getselectedRange().start === this.ViewStateService.curViewPort.selectS && this.ViewStateService.getselectedRange().end === this.ViewStateService.curViewPort.selectE) {
                                        if (this.ViewStateService.getcurClickItems().length === 1) {
                                            // check if in view
                                            if (this.ViewStateService.getselectedRange().start >= this.ViewStateService.curViewPort.sS && this.ViewStateService.getselectedRange().end <= this.ViewStateService.curViewPort.eS) {
                                                this.ViewStateService.setEditing(true);
                                                this.LevelService.openEditArea(this.ViewStateService.getcurClickItems()[0], this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                                                this.ViewStateService.setcursorInTextField(true);
                                            }
                                        } else {
                                            this.ModalService.open('views/error.html', 'Modify Error: Please select a single Segment.');
                                        }
                                    } else {
                                        if (this.ViewStateService.curViewPort.selectE === -1 && this.ViewStateService.curViewPort.selectS === -1) {
                                            this.ModalService.open('views/error.html', 'Error : Please select a Segment or Point to modify it\'s name. Or select a level plus a range in the viewport in order to insert a new Segment.');
                                        } else {
                                            seg = this.LevelService.getClosestItem(this.ViewStateService.curViewPort.selectS, this.ViewStateService.getcurClickLevelName(), this.SoundHandlerService.audioBuffer.length).current;
                                            if (this.ViewStateService.getcurClickLevelType() === 'SEGMENT') {
                                                if (seg === undefined) {
                                                    insSeg = this.LevelService.insertSegment(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE, this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
                                                    if (!insSeg.ret) {
                                                        this.ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
                                                    } else {
                                                        this.HistoryService.addObjToUndoStack({
                                                            'type': 'ANNOT',
                                                            'action': 'INSERTSEGMENTS',
                                                            'name': this.ViewStateService.getcurClickLevelName(),
                                                            'start': this.ViewStateService.curViewPort.selectS,
                                                            'end': this.ViewStateService.curViewPort.selectE,
                                                            'ids': insSeg.ids,
                                                            'segName': this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName
                                                        });
                                                    }
                                                } else {
                                                    if (seg.sampleStart === this.ViewStateService.curViewPort.selectS && (seg.sampleStart + seg.sampleDur + 1) === this.ViewStateService.curViewPort.selectE) {
                                                        this.LevelService.setlasteditArea('_' + seg.id);
                                                        this.LevelService.openEditArea(seg, this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                                                        this.ViewStateService.setEditing(true);
                                                    } else {
                                                        insSeg = this.LevelService.insertSegment(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ViewStateService.curViewPort.selectE, this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName);
                                                        if (!insSeg.ret) {
                                                            this.ModalService.open('views/error.html', 'Error : You are not allowed to insert a Segment here.');
                                                        } else {
                                                            this.HistoryService.addObjToUndoStack({
                                                                'type': 'ANNOT',
                                                                'action': 'INSERTSEGMENTS',
                                                                'name': this.ViewStateService.getcurClickLevelName(),
                                                                'start': this.ViewStateService.curViewPort.selectS,
                                                                'end': this.ViewStateService.curViewPort.selectE,
                                                                'ids': insSeg.ids,
                                                                'segName': this.ConfigProviderService.vals.labelCanvasConfig.newSegmentName
                                                            });
                                                        }
                                                    }
                                                }
                                            } else {
                                                var levelDef = this.ConfigProviderService.getLevelDefinition(this.ViewStateService.getcurClickLevelName());
                                                if (typeof levelDef.anagestConfig === 'undefined') {
                                                    var insPoint = this.LevelService.insertEvent(this.ViewStateService.getcurClickLevelName(), this.ViewStateService.curViewPort.selectS, this.ConfigProviderService.vals.labelCanvasConfig.newEventName);
                                                    if (insPoint.alreadyExists) {
                                                        this.LevelService.setlasteditArea('_' + seg.id);
                                                        this.LevelService.openEditArea(seg, this.LevelService.getlasteditAreaElem(), this.ViewStateService.getcurClickLevelType());
                                                        this.ViewStateService.setEditing(true);
                                                    } else {
                                                        this.HistoryService.addObjToUndoStack({
                                                            'type': 'ANNOT',
                                                            'action': 'INSERTEVENT',
                                                            'name': this.ViewStateService.getcurClickLevelName(),
                                                            'start': this.ViewStateService.curViewPort.selectS,
                                                            'id': insPoint.id,
                                                            'pointName': this.ConfigProviderService.vals.labelCanvasConfig.newEventName
                                                        });
                                                    }
                                                } else {
                                                    this.AnagestService.insertAnagestEvents();
                                                }
                                            }
                                        }
                                    }
                                } else {
                                }
                            }
                        }
                    }
                }


                // undo
                if (code === this.ConfigProviderService.vals.keyMappings.undo) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        this.HistoryService.undo();
                    }
                }


                // redo
                if (code === this.ConfigProviderService.vals.keyMappings.redo) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        this.HistoryService.redo();
                    }
                }

                if (e.originalEvent.code === 'Digit1' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(0, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit2' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(1, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit3' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(2, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit4' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(3, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit5' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(4, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit6' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(5, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit7' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(6, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit8' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(7, this.ConfigProviderService.vals.perspectives);
                }
                if (e.originalEvent.code === 'Digit9' && e.shiftKey) {
                    this.ViewStateService.switchPerspective(8, this.ConfigProviderService.vals.perspectives);
                }

                // deletePreselBoundary
                if (code === this.ConfigProviderService.vals.keyMappings.deletePreselBoundary) {
                    if (this.ViewStateService.getPermission('labelAction')) {
                        e.preventDefault();
                        seg = this.ViewStateService.getcurMouseItem();
                        var cseg = this.ViewStateService.getcurClickItems();
                        var isFirst = this.ViewStateService.getcurMouseisFirst();
                        var isLast = this.ViewStateService.getcurMouseisLast();
                        levelName = this.ViewStateService.getcurMouseLevelName();
                        var type = this.ViewStateService.getcurMouseLevelType();
                        if (!e.shiftKey) {
                            if (this.ConfigProviderService.vals.restrictions.deleteItemBoundary) {
                                if (seg !== undefined) {
                                    var neighbour = this.LevelService.getItemNeighboursFromLevel(levelName, seg.id, seg.id);
                                    if (type === 'SEGMENT') {
                                        deletedSegment = this.LevelService.deleteBoundary(levelName, seg.id, isFirst, isLast);
                                        this.HistoryService.updateCurChangeObj({
                                            'type': 'ANNOT',
                                            'action': 'DELETEBOUNDARY',
                                            'name': levelName,
                                            'id': seg.id,
                                            'isFirst': isFirst,
                                            'isLast': isLast,
                                            'deletedSegment': deletedSegment
                                        });
                                        if (neighbour.left !== undefined) {
                                            deletedLinks = this.LinkService.deleteLinkBoundary(seg.id, neighbour.left.id, this.LevelService);
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'DELETELINKBOUNDARY',
                                                'name': levelName,
                                                'id': seg.id,
                                                'neighbourId': neighbour.left.id,
                                                'deletedLinks': deletedLinks
                                            });
                                        } else {
                                            deletedLinks = this.LinkService.deleteLinkBoundary(seg.id, -1, this.LevelService);
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'DELETELINKBOUNDARY',
                                                'name': levelName,
                                                'id': seg.id,
                                                'neighbourId': -1,
                                                'deletedLinks': deletedLinks
                                            });
                                        }
                                        this.HistoryService.addCurChangeObjToUndoStack();
                                        lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
                                        if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                                            lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                                            this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
                                        }
                                        this.ViewStateService.setcurClickItem(deletedSegment.clickSeg);
                                    } else {
                                        var deletedPoint = this.LevelService.deleteEvent(levelName, seg.id);
                                        if (deletedPoint !== false) {
                                            this.HistoryService.updateCurChangeObj({
                                                'type': 'ANNOT',
                                                'action': 'DELETEEVENT',
                                                'name': levelName,
                                                'start': deletedPoint.samplePoint,
                                                'id': deletedPoint.id,
                                                'pointName': deletedPoint.labels[0].value

                                            });
                                            this.HistoryService.addCurChangeObjToUndoStack();
                                            lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
                                            if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                                                lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                                                this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
                                            }
                                        } else {
                                            this.ViewStateService.setcurMouseItem(undefined, undefined, undefined, undefined, undefined);
                                        }
                                    }
                                }
                            }
                        } else {
                            if (this.ConfigProviderService.vals.restrictions.deleteItem) {
                                if (cseg !== undefined && cseg.length > 0) {
                                    if (this.ViewStateService.getcurClickLevelType() === 'SEGMENT') {
                                        deletedSegment = this.LevelService.deleteSegments(levelName, cseg[0].id, cseg.length);
                                        this.HistoryService.updateCurChangeObj({
                                            'type': 'ANNOT',
                                            'action': 'DELETESEGMENTS',
                                            'name': levelName,
                                            'id': cseg[0].id,
                                            'length': cseg.length,
                                            'deletedSegment': deletedSegment
                                        });
                                        deletedLinks = this.LinkService.deleteLinkSegment(cseg);
                                        this.HistoryService.updateCurChangeObj({
                                            'type': 'ANNOT',
                                            'action': 'DELETELINKSEGMENT',
                                            'name': levelName,
                                            'segments': cseg,
                                            'deletedLinks': deletedLinks
                                        });
                                        this.HistoryService.addCurChangeObjToUndoStack();
                                        lastEventMove = this.LevelService.getClosestItem(this.ViewStateService.getLasPcm() + this.ViewStateService.curViewPort.sS, levelName, this.SoundHandlerService.audioBuffer.length);
                                        if (lastEventMove.current !== undefined && lastEventMove.nearest !== undefined) {
                                            lastNeighboursMove = this.LevelService.getItemNeighboursFromLevel(levelName, lastEventMove.nearest.id, lastEventMove.nearest.id);
                                            this.ViewStateService.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, this.ViewStateService.getLasPcm(), lastEventMove.isFirst, lastEventMove.isLast);
                                        }
                                        this.ViewStateService.setcurClickItem(deletedSegment.clickSeg);
                                    } else {
                                        this.ModalService.open('views/error.html', 'Delete Error: You can not delete Segments on Point Levels.');
                                    }
                                }
                            }
                        }
                    }
                }
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    };

    // private safeApply (fn) {
    //     var phase = this.$root.$$phase;
    //     if (phase === '$apply' || phase === '$digest') {
    //         if (fn && (typeof (fn) === 'function')) {
    //             fn();
    //         }
    //     } else {
    //         this.$apply(fn);
    //     }
    // };

    //remove binding on destroy
    // scope.$on(
    //     '$destroy',
    //     function () {
    //         $(window).off('keydown');
    //     }
    // );
    

}

angular.module('emuwebApp')
.service('HandleGlobalKeyStrokes', [
    '$rootScope', 
    '$timeout',  
    'ViewStateService',  
    'ModalService',  
    'HierarchyManipulationService',  
    'SoundHandlerService',  
    'ConfigProviderService',  
    'HistoryService',  
    'LevelService',  
    'DataService',  
    'LinkService', 
    'AnagestService', 
    'DbObjLoadSaveService', 
    'BrowserDetectorService', 
    HandleGlobalKeyStrokes
]);


