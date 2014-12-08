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
                                DataService,
                                Binarydatamaniphelper) {
        // scopes
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.vs = viewState;
        scope.lvl = LevelService;
        scope.data = DataService;
        scope.history = HistoryService;
        scope.dials = dialogService;
        scope.binary = Binarydatamaniphelper;
        
        // load data
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.data.setData(msajc003_bndl.annotation);
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
        scope.vs.setcurMouseItem(lastEventMove.nearest, lastNeighboursMove, pcm-20, lastEventMove.isFirst, lastEventMove.isLast);
        scope.vs.setcurMouseLevelName(lvlName);
        scope.vs.setcurMouseLevelType(type);  
        scope.vs.setcurClickLevel(lvlName, type, 0);
        scope.vs.setcurClickItem(lastEventMove.current);
    }
    
    it('should react to keyup', function() {
        spyOn(scope, 'applyKeyCodeUp');
        scope.vs.setEditing(true); 
        scope.vs.setcursorInTextField(false);
        var e = jQuery.Event('keyup');
        e.which = 40;
        e.keyCode = 40; 
        e.shiftKey = false;       
        $(document).trigger(e); 
        expect(scope.applyKeyCodeUp).toHaveBeenCalled();
        scope.vs.setcursorInTextField(true);
        scope.vs.setEditing(false);
     });
    
    it('should react to keydown', function() {
        spyOn(scope, 'applyKeyCode');
        var e = jQuery.Event('keydown');
        e.which = 40;
        e.keyCode = 40; 
        e.shiftKey = false;       
        $(document).trigger(e); 
        expect(scope.applyKeyCode).toHaveBeenCalled();
     });
    

    it('should not do anything because of catchMouseForKeyBinding', function() {
        // set catchMouseForKeyBinding to be true
        scope.cps.vals.main.catchMouseForKeyBinding = true;
        // set mouseInEmuWebApp to be false
        scope.vs.mouseInEmuWebApp = false;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.zoomAll, false);
        expect(scope.vs.getPermission).not.toHaveBeenCalled();
        expect(scope.vs.setViewPort).not.toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).not.toHaveBeenCalled();  
        // set catchMouseForKeyBinding back to be false
        scope.cps.vals.main.catchMouseForKeyBinding = false;
        // set mouseInEmuWebApp back to be true
        scope.vs.mouseInEmuWebApp = true;              
    });
    

    it('should zoomAll', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.zoomAll, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.setViewPort).toHaveBeenCalledWith(0, msajc003_bndl.mediaFile.data.length); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomIn', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'zoomViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.zoomIn, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(true, scope.lvl); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomOut', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'zoomViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.zoomOut, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.zoomViewPort).toHaveBeenCalledWith(false, scope.lvl); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should shiftViewPortLeft', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'shiftViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.shiftViewPortLeft, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(false); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should shiftViewPortRight', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'shiftViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.shiftViewPortRight, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('zoom');
        expect(scope.vs.shiftViewPort).toHaveBeenCalledWith(true); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should zoomSel', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setViewPort');
        spyOn(scope.lvl, 'deleteEditArea');
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
            type : 'ANNOT', 
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
            type : 'ANNOT', 
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
            type : 'ANNOT', 
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
			type : 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type : 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
			type: 'ANNOT', 
			action : 'EXPANDSEGMENTS', 
			name : 'Phonetic', 
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
        trigEvent(scope.cps.vals.keyMappings.toggleSideBarLeft, false);
        expect(scope.vs.togglesubmenuOpen).toHaveBeenCalledWith(scope.cps.vals.colors.transitionTime);        
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    });

    it('should toggleSideBarRight', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setRightsubmenuOpen');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.toggleSideBarRight, false);
        expect(scope.vs.setRightsubmenuOpen).toHaveBeenCalledWith(!scope.vs.getRightsubmenuOpen());        
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();        
    }); 

    it('should selectItemsInSelection', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'selectItemsInSelection');
        spyOn(scope.dials, 'open');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.selectItemsInSelection, false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();    
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');    
        expect(scope.dials.open).toHaveBeenCalledWith(
            'views/error.html', 
            'ModalCtrl', 
            'Selection Error : Please select a Level first'
        );                 
        scope.vs.setcurClickLevel('Phonetic', 'SEGMENT', 0);
        trigEvent(scope.cps.vals.keyMappings.selectItemsInSelection, false);
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();    
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.selectItemsInSelection).toHaveBeenCalledWith(scope.data.getLevelData());
    });
    
    it('should selPrevItem', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selPrevItem, false);
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickItem).toHaveBeenCalledWith(neighbours.left); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.setcurClickItem).toHaveBeenCalled();                 
    }); 
    
    it('should selPrevItem with shift', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        spyOn(scope.vs, 'setcurClickItemMultiple').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selPrevItem, true);
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickItemMultiple).toHaveBeenCalledWith(neighbours.left); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.vs.setcurClickItem).toHaveBeenCalled();                  
    }); 
    
    it('should selNextItem', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextItem, false);
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickItem).toHaveBeenCalledWith(neighbours.right); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.vs.setcurClickItem).toHaveBeenCalled();                 
    }); 
    
    it('should selNextItem with shift', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        spyOn(scope.vs, 'setcurClickItemMultiple').and.callThrough();
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        var lvlName = 'Phonetic';
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextItem, true);
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction'); 
        expect(scope.vs.setcurClickItemMultiple).toHaveBeenCalledWith(neighbours.right); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled(); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();    
        expect(scope.vs.setcurClickItem).toHaveBeenCalled();  
    }); 
    
    it('should selNextPrevItem', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextPrevItem, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled();
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.vs.setcurClickItem.calls.argsFor(0)).toEqual([item]);
        expect(scope.vs.setcurClickItem.calls.argsFor(1)).toEqual([neighbours.right, neighbours.right.id]);
    }); 
    
    it('should selNextPrevItem width shift', function() {
        scope.cps.vals.activeButtons.openMenu = true;
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'setlasteditArea');
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        trigEvent(scope.cps.vals.keyMappings.selNextPrevItem, true);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.setlasteditArea).toHaveBeenCalled();
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.vs.setcurClickItem.calls.argsFor(0)).toEqual([item]);
        expect(scope.vs.setcurClickItem.calls.argsFor(1)).toEqual([neighbours.left, neighbours.left.id]);
    });      
    
    it('should deletePreselBoundary on SEGMENT', function() {
        scope.cps.vals.restrictions.deleteItemBoundary = true;
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        scope.vs.curViewPort.selectE = fakePCMclick;
        scope.vs.curViewPort.selectS = fakePCMclick;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurMouseItem').and.callThrough();
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'deleteBoundary').and.returnValue('deletedSegment');
        spyOn(scope.history, 'updateCurChangeObj');
        var lvlName = 'Phonetic';
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        trigEvent(scope.cps.vals.keyMappings.deletePreselBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        // second call after clickOnItem
        expect(scope.lvl.deleteBoundary).toHaveBeenCalledWith(lvlName, neighbours.right.id, false, false);
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith({
            'type': 'ANNOT',
            'action': 'DELETEBOUNDARY',
            'name': lvlName,
            'id': neighbours.right.id,
            'isFirst': false,
            'isLast': false,
            'deletedSegment': 'deletedSegment'
        });
    });    
    
    it('should deletePreselBoundary on SEGMENT with shift', function() {
        var lvlName = 'Phonetic';
        var length = 1;
        scope.cps.vals.restrictions.deleteItemBoundary = true;
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        scope.vs.curViewPort.selectE = fakePCMclick;
        scope.vs.curViewPort.selectS = fakePCMclick;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurMouseItem').and.callThrough();
        spyOn(scope.vs, 'setcurClickItem').and.callThrough();        
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'deleteSegments').and.returnValue(lvlName);
        spyOn(scope.history, 'updateCurChangeObj');
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        trigEvent(scope.cps.vals.keyMappings.deletePreselBoundary, true);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.deleteSegments).toHaveBeenCalledWith(lvlName, item.id, length);
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith({
            'type': 'ANNOT',
            'action': 'DELETESEGMENTS',
            'name': lvlName,
            'id': item.id,
            'length': length,
            'deletedSegment': lvlName
        });
    });  
    
    it('should deletePreselBoundary on EVENT', function() {
        var lvlName = 'Tone';
        scope.cps.vals.restrictions.deleteItemBoundary = true;
        scope.vs.curViewPort.eS = msajc003_bndl.mediaFile.data.length;
        scope.vs.curViewPort.selectE = fakePCMclick;
        scope.vs.curViewPort.selectS = fakePCMclick;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.vs, 'setcurMouseItem').and.callThrough();        
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'deleteEvent').and.returnValue({"id":fakePCMtime, "samplePoint":fakePCMtime, "labels":[{"name":"Word","value":lvlName}]});
        spyOn(scope.history, 'updateCurChangeObj');
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'EVENT');
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).current;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        trigEvent(scope.cps.vals.keyMappings.deletePreselBoundary, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
        expect(scope.lvl.deleteEvent).toHaveBeenCalledWith(lvlName, item.id);
        expect(scope.history.updateCurChangeObj).toHaveBeenCalledWith({
            'type': 'ANNOT',
            'action': 'DELETEEVENT',
            'name': lvlName,
            'start': fakePCMtime,
            'id': fakePCMtime,
            'pointName': lvlName
        });
    });
    
    it('should escape from viewState.isEditing()', function() {
        // set editing to be true
        scope.vs.setEditing(true);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.esc, false);
        expect(scope.vs.isEditing()).toBe(false); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        // set setEditing back to be false
        scope.vs.setEditing(false);
    });   
 
    it('should rename on viewState.isEditing()', function() {
        // set editing to be true
        scope.vs.setEditing(true);
        scope.lvl.setlasteditArea('_141');
        scope.vs.setcurClickLevelName('Word',0);
        scope.vs.setCurLevelAttrDefs(epgdorsalDbConfig.levelDefinitions);
        spyOn(scope.history, 'addObjToUndoStack');
        spyOn(scope.lvl, 'getItemFromLevelById').and.returnValue({"labels":[{"name":"Word","value":"V"}]});
        spyOn(scope.lvl, 'renameLabel');
        spyOn(scope.lvl, 'deleteEditArea');
        trigEvent(scope.cps.vals.keyMappings.createNewItemAtSelection, false);
        expect(scope.history.addObjToUndoStack).toHaveBeenCalled(); 
        expect(scope.lvl.getItemFromLevelById).toHaveBeenCalled();  
        expect(scope.lvl.renameLabel).toHaveBeenCalled();  
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled();  
        // set setEditing back to be false
        scope.vs.setEditing(false);
    });
    
    it('should createNewItemAtSelection -> open existing SEGMENT element for editing', function() {
        scope.cps.vals.restrictions.addItem = true;
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'openEditArea');
        spyOn(scope.lvl, 'setlasteditArea').and.callThrough(); 
        spyOn(scope.vs, 'setEditing');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');        
        trigEvent(scope.cps.vals.keyMappings.createNewItemAtSelection, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
        expect(scope.lvl.setlasteditArea).toHaveBeenCalledWith('_'+neighbours.left.id); 
        expect(scope.vs.setEditing).toHaveBeenCalledWith(true); 
        expect(scope.lvl.openEditArea).toHaveBeenCalledWith(neighbours.left, null, 'SEGMENT'); 
    }); 
    
    it('should createNewItemAtSelection -> insert new SEGMENT', function() {
        scope.cps.vals.restrictions.addItem = true;
        scope.vs.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'insertSegment').and.returnValue({ret: true, ids: fakePCMclick});
        spyOn(scope.history, 'addObjToUndoStack');
        var lvlName = 'Phonetic';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'SEGMENT');        
        scope.vs.curViewPort.selectS = fakePCMclick;
        scope.vs.curViewPort.selectE = fakePCMclick;
        trigEvent(scope.cps.vals.keyMappings.createNewItemAtSelection, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.insertSegment).toHaveBeenCalledWith(lvlName, fakePCMclick, fakePCMclick, scope.cps.vals.labelCanvasConfig.newSegmentName); 
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
			'type': 'ANNOT',
			'action': 'INSERTSEGMENTS',
			'name': lvlName,
			'start': fakePCMclick,
			'end': fakePCMclick,
			'ids': fakePCMclick,
			'segName': scope.cps.vals.labelCanvasConfig.newSegmentName
		}); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
    }); 
    
    it('should createNewItemAtSelection -> insert new EVENT', function() {
        scope.cps.vals.restrictions.addItem = true;
        scope.vs.setCurLevelAttrDefs(aeDbConfig.levelDefinitions);
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.lvl, 'insertEvent').and.returnValue({alreadyExists: false, id: fakePCMclick});
        spyOn(scope.history, 'addObjToUndoStack');
        var lvlName = 'Tone';
        var item = scope.lvl.getClosestItem(fakePCMclick,lvlName,msajc003_bndl.mediaFile.data.length).nearest;
        var neighbours = scope.lvl.getItemNeighboursFromLevel(lvlName, item.id, item.id);
        clickOnItem(lvlName, fakePCMclick, msajc003_bndl.mediaFile.data.length, 'EVENT');        
        scope.vs.curViewPort.selectS = fakePCMclick;
        scope.vs.curViewPort.selectE = fakePCMclick;
        trigEvent(scope.cps.vals.keyMappings.createNewItemAtSelection, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.lvl.insertEvent).toHaveBeenCalledWith(lvlName, fakePCMclick, scope.cps.vals.labelCanvasConfig.newSegmentName); 
        expect(scope.history.addObjToUndoStack).toHaveBeenCalledWith({
            'type': 'ANNOT',
            'action': 'INSERTEVENT',
            'name': lvlName,
            'start': fakePCMclick,
            'id': fakePCMclick,
            'pointName': scope.cps.vals.labelCanvasConfig.newSegmentName
        }); 
        expect(scope.lvl.deleteEditArea).toHaveBeenCalled(); 
    }); 
    
    it('should undo', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.history, 'undo');
        trigEvent(scope.cps.vals.keyMappings.undo, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.history.undo).toHaveBeenCalled();        
    }); 
    
    it('should redo', function() {
        spyOn(scope.vs, 'getPermission').and.returnValue(true);
        spyOn(scope.lvl, 'deleteEditArea');
        spyOn(scope.history, 'redo');
        trigEvent(scope.cps.vals.keyMappings.redo, false);
        expect(scope.vs.getPermission).toHaveBeenCalledWith('labelAction');
        expect(scope.history.redo).toHaveBeenCalled();        
    });   
});