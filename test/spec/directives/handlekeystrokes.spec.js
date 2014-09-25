'use strict';

describe('Directive: handleglobalkeystrokes', function() {

    var elm, scope;
    var fakePCMtime = 123;
    var fakePCMclick = 25000;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function ($rootScope, 
                                $compile, 
                                ConfigProviderService, 
                                Soundhandlerservice, 
                                viewState, 
                                LevelService, 
                                HistoryService,
                                dialogService,
                                Binarydatamaniphelper) {
        // scopes
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.vs = viewState;
        scope.lvl = LevelService;
        scope.history = HistoryService;
        scope.dials = dialogService;
        scope.binary = Binarydatamaniphelper;
        
        // load data
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.lvl.setData(msajc003_bndl.annotation);
        scope.shs.wavJSO.Data = msajc003_bndl.mediaFile.data;
        
        // compile
        compileDirective();
    }));

    function compileDirective() {
        var tpl = '<span><div handleglobalkeystrokes></div></span>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$digest();
    }
    
    function trigEvent(key, shiftKey) {
        var e = jQuery.Event('keypress');
        e.which = key;
        e.keyCode = key; 
        e.shiftKey = shiftKey;       
        $(document).trigger(e);    
    }
    
    function clickOnItem(lvlName, pcm, pcmLength, type) {
        var lastEventMove = scope.lvl.getClosestItem(pcm, lvlName, pcmLength);
        var lastNeighboursMove = scope.lvl.getItemNeighboursFromLevel(lvlName, lastEventMove.nearest.id, lastEventMove.nearest.id);
        scope.vs.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, pcm-20, lastEventMove.isFirst, lastEventMove.isLast);
        scope.vs.setcurMouseLevelName(lvlName);
        scope.vs.setcurMouseLevelType(type);  
        scope.vs.setcurClickLevel(lvlName, type, 0);
        scope.vs.setcurClickSegment(lastEventMove.current);
    }
    

    it('should not do anything because of catchMouseForKeyBinding', function() {
        // set catchMouseForKeyBinding to be true
        scope.cps.vals.main.catchMouseForKeyBinding = true;
        // set mouseInEmuWebApp to be false
        scope.vs.mouseInEmuWebApp = false;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.zoomAll, false);
        expect(scope.vs.getPermission).not.toHaveBeenCalled();
        expect(scope.vs.setViewPort).not.toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).not.toHaveBeenCalled();  
        // set catchMouseForKeyBinding back to be false
        scope.cps.vals.main.catchMouseForKeyBinding = false;
        // set mouseInEmuWebApp back to be true
        scope.vs.mouseInEmuWebApp = true;              
    });
    
    it('should createNewItemAtSelection (focusInTextField)', function() {
        // set focusInTextField to be true
        scope.vs.focusInTextField = true;
        scope.vs.setEditing(true);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.lvl, 'getItemFromLevelById').and.returnValue({"labels":[{"name":"Word","value":"V"}]} );
        spyOn(scope.lvl, 'renameLabel');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.createNewItemAtSelection, false);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalled(); 
        expect(scope.lvl.getItemFromLevelById).toHaveBeenCalled();  
        expect(scope.lvl.renameLabel).toHaveBeenCalled();  
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        // set focusInTextField back to be false
        scope.vs.focusInTextField = false;
        // set setEditing back to be false
        scope.vs.setEditing(false);
    });
    
    it('should escape from createNewItemAtSelection (focusInTextField)', function() {
        // set focusInTextField to be true
        scope.vs.focusInTextField = true;
        scope.vs.setEditing(true);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.esc, false);
        expect(scope.vs.focusInTextField).toBe(false); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        // set focusInTextField back to be false
        scope.vs.focusInTextField = false;
        // set setEditing back to be false
        scope.vs.setEditing(false);
    });

    it('should zoomAll', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.zoomAll, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(0, msajc003_bndl.mediaFile.data.length); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomIn', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'zoomViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.zoomIn, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(true, scope.lvl); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomOut', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'zoomViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.zoomOut, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(false, scope.lvl); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should shiftViewPortLeft', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'shiftViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.shiftViewPortLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(false); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should shiftViewPortRight', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'shiftViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.shiftViewPortRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(true); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomSel', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            selectS: fakePCMtime,
            selectE: 2*fakePCMtime
        }        
        trigEvent(scope.cps.vals.keyMappings.zoomSel, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(fakePCMtime, 2*fakePCMtime); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playEntireFile', function() {
        scope.cps.vals.restrictions.playback = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.playEntireFile, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(0, msajc003_bndl.mediaFile.data.length); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(0, msajc003_bndl.mediaFile.data.length); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playAllInView', function() {
        scope.cps.vals.restrictions.playback = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            sS: fakePCMtime,
            eS: 2*fakePCMtime
        }                
        trigEvent(scope.cps.vals.keyMappings.playAllInView, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(fakePCMtime, 2*fakePCMtime); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(fakePCMtime, 2*fakePCMtime); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playSelected', function() {
        scope.cps.vals.restrictions.playback = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            selectS: fakePCMtime,
            selectE: 2*fakePCMtime
        }                
        trigEvent(scope.cps.vals.keyMappings.playSelected, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(fakePCMtime, 2*fakePCMtime); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(fakePCMtime, 2*fakePCMtime); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should selectContourCorrectionTools', function() {
        scope.cps.vals.restrictions.correctionTool = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        // first
        trigEvent(scope.cps.vals.keyMappings.selectFirstContourCorrectionTool, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.vs.curCorrectionToolNr).toBe(1); 
        // second
        trigEvent(scope.cps.vals.keyMappings.selectSecondContourCorrectionTool, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.vs.curCorrectionToolNr).toBe(2); 
        // third
        trigEvent(scope.cps.vals.keyMappings.selectThirdContourCorrectionTool, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.vs.curCorrectionToolNr).toBe(3); 
        // fourth
        trigEvent(scope.cps.vals.keyMappings.selectFourthContourCorrectionTool, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.vs.curCorrectionToolNr).toBe(4); 
        // NO
        trigEvent(scope.cps.vals.keyMappings.selectNoContourCorrectionTool, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.vs.curCorrectionToolNr).toBe(undefined); 
    });

    it('should levelUp', function() {
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'selectLevel');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.levelUp, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.vs.selectLevel).toHaveBeenCalledWith(
            false, 
            scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.order, 
            scope.lvl
        ); 
    });

    it('should levelDown', function() {
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'selectLevel');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.levelDown, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.vs.selectLevel).toHaveBeenCalledWith(
            true, 
            scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.order, 
            scope.lvl
        ); 
    });

    it('should snapBoundaryToNearestTopBoundary', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'snapBoundary').and.returnValue(fakePCMtime);
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        compileDirective();
        var lvlName = 'Tone';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestTopBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.snapBoundary).toHaveBeenCalledWith( 
            true, 
            lvlName, 
            item,
            { 
                left : scope.lvl.getItemFromLevelById(lvlName, scope.lvl.getIdByOrder(lvlName, scope.lvl.getOrderById(lvlName, item.id) - 1)), 
                right : scope.lvl.getItemFromLevelById(lvlName, scope.lvl.getIdByOrder(lvlName, scope.lvl.getOrderById(lvlName, item.id) + 1)) 
            }, 
            'SEGMENT' 
        );
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith( 
        { 
            type : 'ESPS', 
            action : 'MOVEBOUNDARY', 
            name : lvlName, 
            id : item.id, 
            movedBy : fakePCMtime, 
            position : 0 
        });      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });

    it('should snapBoundaryToNearestBottomBoundary', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'snapBoundary').and.returnValue(fakePCMtime);
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        compileDirective();
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestBottomBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.snapBoundary).toHaveBeenCalledWith(
            false, 
            lvlName, 
            item, 
            { 
                left : scope.lvl.getItemFromLevelById(lvlName, scope.lvl.getIdByOrder(lvlName, scope.lvl.getOrderById(lvlName, item.id) - 1)), 
                right : scope.lvl.getItemFromLevelById(lvlName, scope.lvl.getIdByOrder(lvlName, scope.lvl.getOrderById(lvlName, item.id) + 1)) 
            }, 
            'SEGMENT' 
        );
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith( 
        { 
            type : 'ESPS', 
            action : 'MOVEBOUNDARY', 
            name : lvlName, 
            id : item.id, 
            movedBy : fakePCMtime, 
            position : 0 
        });      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });

    it('should snapBoundaryToNearestZeroCrossing', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        compileDirective();
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'calcDistanceToNearestZeroCrossing').and.returnValue(fakePCMtime);
        spyOn(scope.lvl, 'moveBoundary');
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestZeroCrossing, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.calcDistanceToNearestZeroCrossing).toHaveBeenCalledWith(item.sampleStart);
        expect(scope.lvl.moveBoundary).toHaveBeenCalledWith(lvlName, item.id, fakePCMtime, 0 );  
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith( 
        { 
            type : 'ESPS', 
            action : 'MOVEBOUNDARY', 
            name : lvlName, 
            id : item.id, 
            movedBy : fakePCMtime, 
            position : 0 
        });      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });

    it('should not expandSelSegmentsRight', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        // no level selected
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select a Level first'
        ); 
        // no item selected
        scope.vs.setcurClickLevelName('Phonetic');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select one or more Segments first'
        ); 
    });  
    
    it('should not expandSelSegmentsLeft', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        // no level selected
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select a Level first'
        ); 
        // no item selected
        scope.vs.setcurClickLevelName('Phonetic');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select one or more Segments first'
        ); 
    }); 
    
    it('should not shrinkSelSegmentsLeft', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        // no level selected
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select a Level first'
        ); 
        // no item selected
        scope.vs.setcurClickLevelName('Phonetic');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select one or more Segments first'
        ); 
    }); 
    
    it('should not shrinkSelSegmentsRight', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        // no level selected
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select a Level first'
        ); 
        // no item selected
        scope.vs.setcurClickLevelName('Phonetic');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Expand Segments Error: Please select one or more Segments first'
        ); 
    }); 
    
    it('should expandSelSegmentsRight', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        
        // absolute
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'absolute';
        scope.cps.vals.labelCanvasConfig.addTimeValue = fakePCMtime;
        spyOn(scope.lvl, 'expandSegment');
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.vs, 'selectBoundary');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(true, [item], lvlName, fakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : true, 
			changeTime : fakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
        // relative
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'relative';
        scope.cps.vals.labelCanvasConfig.addTimeValue = 2;
        var newfakePCMtime = scope.cps.vals.labelCanvasConfig.addTimeValue * (msajc003_bndl.mediaFile.data.length / 100);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(true, [item], lvlName, newfakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : true, 
			changeTime : newfakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
    }); 
    
    
    it('should expandSelSegmentsLeft', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        
        // absolute
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'absolute';
        scope.cps.vals.labelCanvasConfig.addTimeValue = fakePCMtime;
        spyOn(scope.lvl, 'expandSegment');
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.vs, 'selectBoundary');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(false, [item], lvlName, fakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : false, 
			changeTime : fakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
        // relative
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'relative';
        scope.cps.vals.labelCanvasConfig.addTimeValue = 2;
        var newfakePCMtime = scope.cps.vals.labelCanvasConfig.addTimeValue * (msajc003_bndl.mediaFile.data.length / 100);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.expandSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(false, [item], lvlName, newfakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : false, 
			changeTime : newfakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
    }); 
    
    
    it('should shrinkSelSegmentsLeft', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        
        // absolute
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'absolute';
        scope.cps.vals.labelCanvasConfig.addTimeValue = fakePCMtime;
        spyOn(scope.lvl, 'expandSegment');
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.vs, 'selectBoundary');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(true, [item], lvlName, -fakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : true, 
			changeTime : -fakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
        // relative
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'relative';
        scope.cps.vals.labelCanvasConfig.addTimeValue = 2;
        var newfakePCMtime = scope.cps.vals.labelCanvasConfig.addTimeValue * (msajc003_bndl.mediaFile.data.length / 100);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(true, [item], lvlName, -newfakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : true, 
			changeTime : -newfakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
    });  
    
    it('should shrinkSelSegmentsRight', function() {
        scope.cps.vals.restrictions.editItemSize = true;
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.dials, 'open');
        compileDirective();
        
        // absolute
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'absolute';
        scope.cps.vals.labelCanvasConfig.addTimeValue = fakePCMtime;
        spyOn(scope.lvl, 'expandSegment');
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.vs, 'selectBoundary');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(false, [item], lvlName, -fakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : false, 
			changeTime : -fakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
        
        // relative
        scope.cps.vals.labelCanvasConfig.addTimeMode = 'relative';
        scope.cps.vals.labelCanvasConfig.addTimeValue = 2;
        var newfakePCMtime = scope.cps.vals.labelCanvasConfig.addTimeValue * (msajc003_bndl.mediaFile.data.length / 100);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.shrinkSelSegmentsRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.expandSegment).toHaveBeenCalledWith(false, [item], lvlName, -newfakePCMtime);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({ 
			type : 'ESPS', 
			action : 'EXPANDSEGMENTS', 
			levelName : 'Phonetic', 
			item : [ item ], 
			rightSide : false, 
			changeTime : -newfakePCMtime 
        });
        expect(scope.vs.selectBoundary).toHaveBeenCalled();
        expect(scope.dials.open).not.toHaveBeenCalled();
    });  

    it('should toggleSideBarLeft', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'togglesubmenuOpen');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.toggleSideBarLeft, false);
        expect(scope.vs.togglesubmenuOpen).toHaveBeenCalledWith(scope.cps.vals.colors.transitionTime);        
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should toggleSideBarRight', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setRightsubmenuOpen');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.toggleSideBarRight, false);
        expect(scope.vs.setRightsubmenuOpen).toHaveBeenCalledWith(!scope.vs.getRightsubmenuOpen());        
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 

    it('should selectSegmentsInSelection', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'selectSegmentsInSelection');
        spyOn(scope.dials, 'open');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.selectSegmentsInSelection, false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();    
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');    
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Selection Error : Please select a Level first'
        );                 
        scope.vs.setcurClickLevel('Phonetic', 'SEGMENT', 0);
        trigEvent(scope.cps.vals.keyMappings.selectSegmentsInSelection, false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();    
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.selectSegmentsInSelection).toHaveBeenCalledWith(scope.lvl.data.levels);
    });
    
    it('should selPrevItem', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickSegment').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        compileDirective();
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selPrevItem, false);
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickSegment).toHaveBeenCalledWith(neighbours.left); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 
    
    it('should selPrevItem with shift', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickSegment').and.callThrough();
        spyOn(scope.vs, 'setcurClickSegmentMultiple').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        compileDirective();
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selPrevItem, true);
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickSegmentMultiple).toHaveBeenCalledWith(neighbours.left); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 
    
    it('should selNextItem', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickSegment').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        compileDirective();
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextItem, false);
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickSegment).toHaveBeenCalledWith(neighbours.right); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 
    
    it('should selNextItem with shift', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickSegment').and.callThrough();
        spyOn(scope.vs, 'setcurClickSegmentMultiple').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        compileDirective();
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextItem, true);
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickSegmentMultiple).toHaveBeenCalledWith(neighbours.right); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 
    
/*
    todo selNextPrevItem, deletePreselBoundary, createNewItemAtSelection, undo, redo, 
*/

});