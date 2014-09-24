'use strict';

describe('Directive: handleglobalkeystrokes', function() {

    var elm, scope;
    var fakeMove = 123;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function ($rootScope, $compile, ConfigProviderService, Soundhandlerservice, viewState, LevelService, HistoryService) {
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.vs = viewState;
        scope.lvl = LevelService;
        scope.history = HistoryService;
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
    

    it('should not do anything because of catchMouseForKeyBinding', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        // set catchMouseForKeyBinding to be true
        scope.cps.vals.main.catchMouseForKeyBinding = true;
        // set mouseInEmuWebApp to be false
        scope.vs.mouseInEmuWebApp = false;
        scope.shs.wavJSO.Data = new Array(58089);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        // set focusInTextField to be true
        scope.vs.focusInTextField = true;
        scope.vs.setEditing(true);
        scope.shs.wavJSO.Data = new Array(58089);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        scope.lvl.setData(msajc003_bndl.annotation);
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.lvl, 'getItemFromLevelById').and.returnValue({"labels":[{"name":"Phonetic","value":"V"}]} );
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
        scope.cps.setVals(defaultEmuwebappConfig);
        // set focusInTextField to be true
        scope.vs.focusInTextField = true;
        scope.vs.setEditing(true);
        scope.shs.wavJSO.Data = new Array(58089);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        scope.lvl.setData(msajc003_bndl.annotation);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.zoomAll, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(0, 58089); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomIn', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.shs.wavJSO.Data = new Array(58089);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            selectS: 100,
            selectE: 150
        }        
        trigEvent(scope.cps.vals.keyMappings.zoomSel, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(100, 150); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playEntireFile', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.playback = true;
        scope.shs.wavJSO.Data = new Array(58089);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.playEntireFile, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(0, 58089); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(0, 58089); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playAllInView', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.playback = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            sS: 100,
            eS: 150
        }                
        trigEvent(scope.cps.vals.keyMappings.playAllInView, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(100, 150); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(100, 150); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should playSelected', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.playback = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'animatePlayHead');
        spyOn(scope.shs, 'playFromTo');
        spyOn(scope.lvl, 'deleteEditArea');
        compileDirective();
        scope.vs.curViewPort = {
            selectS: 100,
            selectE: 150
        }                
        trigEvent(scope.cps.vals.keyMappings.playSelected, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('playaudio');
        expect(scope.vs.animatePlayHead).toHaveBeenCalledWith(100, 150); 
        expect(scope.shs.playFromTo).toHaveBeenCalledWith(100, 150); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should selectContourCorrectionTools', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
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
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'selectLevel');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.levelUp, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.vs.selectLevel).toHaveBeenCalledWith(false, scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.order, scope.lvl); 
    });

    it('should levelDown', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.vs.curPerspectiveIdx = 0;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'selectLevel');
        compileDirective();
        trigEvent(scope.cps.vals.keyMappings.levelDown, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
        expect(scope.vs.selectLevel).toHaveBeenCalledWith(true, scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].levelCanvases.order, scope.lvl); 
    });

    it('should snapBoundaryToNearestTopBoundary', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.editItemSize = true;
        scope.lvl.setData(msajc003_bndl.annotation);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'snapBoundary').and.returnValue(fakeMove);
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        compileDirective();
        var lvlName = 'Tone';
        var lastEventMove = scope.lvl.getClosestItem(25000, lvlName, 58089);
        var lastNeighboursMove = scope.lvl.getItemNeighboursFromLevel(lvlName, lastEventMove.nearest.id, lastEventMove.nearest.id);
        scope.vs.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, 18631, lastEventMove.isFirst, lastEventMove.isLast);
        scope.vs.setcurMouseLevelName(lvlName);
        scope.vs.setcurMouseLevelType('SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestTopBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.snapBoundary).toHaveBeenCalledWith( true, 'Tone', { id : 183, samplePoint : 22139, labels : [ { name : 'Tone', value : 'L-' } ] }, { left : { id : 182, samplePoint : 18631, labels : [ { name : 'Tone', value : 'H*' } ] }, right : { id : 184, samplePoint : 38254, labels : [ { name : 'Tone', value : 'H*' } ] } }, 'SEGMENT' );
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith( { type : 'ESPS', action : 'MOVEBOUNDARY', name : 'Tone', id : 183, movedBy : fakeMove, position : 0 } );      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });

    it('should snapBoundaryToNearestBottomBoundary', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.editItemSize = true;
        scope.lvl.setData(msajc003_bndl.annotation);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'snapBoundary').and.returnValue(fakeMove);
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        compileDirective();
        var lvlName = 'Phonetic';
        var lastEventMove = scope.lvl.getClosestItem(25000, lvlName, 58089);
        var lastNeighboursMove = scope.lvl.getItemNeighboursFromLevel(lvlName, lastEventMove.nearest.id, lastEventMove.nearest.id);
        scope.vs.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, 18631, lastEventMove.isFirst, lastEventMove.isLast);
        scope.vs.setcurMouseLevelName(lvlName);
        scope.vs.setcurMouseLevelType('SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestBottomBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.snapBoundary).toHaveBeenCalledWith(false, 'Phonetic', { id : 160, sampleStart : 25790, sampleDur : 2609, labels : [ { name : 'Phonetic', value : 'S' } ] }, { left : { id : 159, sampleStart : 23920, sampleDur : 1869, labels : [ { name : 'Phonetic', value : 'z' } ] }, right : { id : 161, sampleStart : 28400, sampleDur : 864, labels : [ { name : 'Phonetic', value : 'i:' } ] } }, 'SEGMENT');
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith( { type : 'ESPS', action : 'MOVEBOUNDARY', name : 'Phonetic', id : 160, movedBy : fakeMove, position : 0 } );      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });

    it('should snapBoundaryToNearestZeroCrossing', function() {
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.vals.restrictions.editItemSize = true;
        scope.lvl.setData(msajc003_bndl.annotation);
        compileDirective();
        var lvlName = 'Phonetic';
        var lastEventMove = scope.lvl.getClosestItem(25000, lvlName, 58089);
        var lastNeighboursMove = scope.lvl.getItemNeighboursFromLevel(lvlName, lastEventMove.nearest.id, lastEventMove.nearest.id);
        scope.vs.setcurMouseSegment(lastEventMove.nearest, lastNeighboursMove, 24990, lastEventMove.isFirst, lastEventMove.isLast);
        scope.vs.setcurMouseLevelName(lvlName);
        scope.vs.setcurMouseLevelType('SEGMENT');
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'calcDistanceToNearestZeroCrossing').and.returnValue(fakeMove);
        spyOn(scope.lvl, 'moveBoundary');
        spyOn(scope.history, 'updateCurChangeObj');
        spyOn(scope.history, 'addCurChangeObjToUndoStack');
        trigEvent(scope.cps.vals.keyMappings.snapBoundaryToNearestZeroCrossing, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        expect(scope.lvl.calcDistanceToNearestZeroCrossing).toHaveBeenCalledWith(25790);
        expect(scope.lvl.moveBoundary).toHaveBeenCalledWith(lvlName, 160, fakeMove, 0 );  
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith({ type : 'ESPS', action : 'MOVEBOUNDARY', name : 'Phonetic', id : 160, movedBy : fakeMove, position : 0 });      
        expect(scope.history.addCurChangeObjToUndoStack).toHaveBeenCalled();      
    });
    
    // todo : expandSelSegmentsRight and further

});