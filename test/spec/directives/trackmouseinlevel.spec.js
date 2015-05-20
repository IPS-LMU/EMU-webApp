'use strict';

describe('Directive: trackmouseinlevel', function () {

    var elm, tpl, scope, curLvl, testitem;
    var lvlName = 'Phonetic';
    var lvlType = 'SEGMENT';
    
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, Soundhandlerservice, DataService, LevelService, ConfigProviderService, viewState, HistoryService) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.data = DataService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.shs = Soundhandlerservice;
        scope.history = HistoryService;
        scope.data.setData(msajc003_bndl.annotation);
        curLvl = scope.lvl.getLevelDetails(lvlName).level;
        scope.level = curLvl;
        testitem = msajc003_bndl.annotation.levels[6].items[0];
    }));

    function compileDirective(name, type) {
        tpl = '<canvas width="2048" height="64" track-mouse-in-level level-name="'+name+'" level-type="'+type+'"></canvas>';
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }
    
    it('should react to click', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'setLastMove');
        spyOn(elm.isolateScope(), 'setLastClick');
        var e = jQuery.Event('click');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
        expect(elm.isolateScope().setLastClick).toHaveBeenCalled();
     });  
    
    it('should react to contextmenu', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'setLastMove');
        spyOn(elm.isolateScope(), 'setLastRightClick');
        var e = jQuery.Event('contextmenu');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
        expect(elm.isolateScope().setLastRightClick).toHaveBeenCalled();
     }); 
    
    it('should react to dblclick when enabled', function() {
        compileDirective();
        scope.cps.vals.restrictions.editItemName = true;
        spyOn(elm.isolateScope(), 'setLastMove');
        spyOn(elm.isolateScope(), 'setLastDblClick');
        spyOn(elm.isolateScope(), 'setLastClick');
        var e = jQuery.Event('dblclick');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
        expect(elm.isolateScope().setLastDblClick).toHaveBeenCalled();
        expect(elm.isolateScope().setLastClick).not.toHaveBeenCalled();
     });   
    
    it('should react to dblclick when disabled', function() {
        compileDirective();
        scope.cps.vals.restrictions.editItemName = false;
        spyOn(elm.isolateScope(), 'setLastMove');
        spyOn(elm.isolateScope(), 'setLastDblClick');
        spyOn(elm.isolateScope(), 'setLastClick');
        var e = jQuery.Event('dblclick');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
        expect(elm.isolateScope().setLastDblClick).not.toHaveBeenCalled();
        expect(elm.isolateScope().setLastClick).toHaveBeenCalled();
     }); 
    
    it('should react to mousedown', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'setLastMove');
        var e = jQuery.Event('mousedown');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
     });    
    
    it('should react to mouseup', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'setLastMove');
        var e = jQuery.Event('mouseup');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
     });   
     
    it('should react to mouseout', function() {
        compileDirective();
        spyOn(elm.isolateScope(), 'setLastMove');
        var e = jQuery.Event('mouseout');
        elm.trigger(e); 
        expect(elm.isolateScope().setLastMove).toHaveBeenCalled();
     });  
     
    it('should react to mousemove with levelType == SEGMENT and samplesPerPixel == 0.1 and isFirst:true and isLast:false', function() {
        compileDirective(lvlName, lvlType);
        scope.vs.setdragBarActive(false);
        scope.vs.curMouseisFirst = true;
        scope.cps.vals.restrictions.editItemSize = true;
        scope.lastPCM = 0;
        scope.shs.wavJSO.Data = new Array(58089);
        elm.isolateScope().levelType = lvlType;
        spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(0.1);
        spyOn(scope.vs, 'getX').and.returnValue(10);
        spyOn(scope.vs, 'getcurMouseItem').and.returnValue({});
        spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem, isFirst: true, isLast:false});
        spyOn(scope.lvl, 'getItemDetails').and.returnValue({sampleStart: 1000});
        spyOn(scope.lvl, 'moveBoundary');
        spyOn(scope.history, 'updateCurChangeObj');
        var e = jQuery.Event('mousemove');
        e.shiftKey = true;
        elm.trigger(e); 
        expect(scope.vs.getSamplesPerPixelVal).toHaveBeenCalled();
        expect(scope.vs.getX).toHaveBeenCalled();
        expect(scope.lvl.getClosestItem).toHaveBeenCalled();
        expect(scope.vs.getcurMouseItem).toHaveBeenCalled();
        expect(scope.lvl.getItemDetails).toHaveBeenCalled();
        expect(scope.lvl.moveBoundary).toHaveBeenCalled();
        expect(scope.history.updateCurChangeObj).toHaveBeenCalled();
        expect(scope.vs.movingBoundarySample).toEqual(1);
     });   
    
    it('should react to mousemove with levelType == SEGMENT and samplesPerPixel == 0.1 and isFirst:false and isLast:true', function() {
        compileDirective(lvlName, lvlType);
        scope.vs.setdragBarActive(false);
        scope.cps.vals.restrictions.editItemSize = true;
        scope.lastPCM = 0;
        scope.shs.wavJSO.Data = new Array(58089);
        elm.isolateScope().levelType = lvlType;
        spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(0.1);
        spyOn(scope.vs, 'getX').and.returnValue(10);
        spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem, isFirst: false, isLast:true});
        spyOn(scope.lvl, 'getLastItem').and.returnValue({sampleStart: 0, sampleDur: 0});
        var e = jQuery.Event('mousemove');
        e.shiftKey = true;
        elm.trigger(e); 
        expect(scope.vs.getSamplesPerPixelVal).toHaveBeenCalled();
        expect(scope.vs.getX).toHaveBeenCalled();
        expect(scope.lvl.getClosestItem).toHaveBeenCalled();
        expect(scope.lvl.getLastItem).toHaveBeenCalled();
     });   
     
   it('should setLastClick', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem});
     elm.isolateScope().setLastClick(0);
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
   });     
     
   it('should setLastRightClick', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     scope.vs.setcurClickLevelName('test');
     elm.isolateScope().levelName = lvlName;
     compileDirective();
     spyOn(elm.isolateScope(), 'setLastClick');
     spyOn(scope.vs, 'setcurClickLevel');
     spyOn(scope.vs, 'setcurClickItemMultiple');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.vs, 'selectBoundary');
     spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem});
     spyOn(scope.lvl, 'deleteEditArea');
     elm.isolateScope().setLastRightClick(0);
     expect(elm.isolateScope().setLastClick).toHaveBeenCalled();
     expect(scope.vs.setcurClickLevel).toHaveBeenCalled();
     expect(scope.vs.setcurClickItemMultiple).toHaveBeenCalled();
     expect(scope.vs.selectBoundary).toHaveBeenCalled();
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
     expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
   });
        
    
  it('should setLastDblClick on Event', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     spyOn(scope.vs, 'setcurClickLevel');
     spyOn(scope.vs, 'setcurClickItem');
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem});
     spyOn(scope.lvl, 'openEditArea');
     elm.isolateScope().setLastDblClick(0);
     expect(scope.vs.setcurClickLevel).toHaveBeenCalled();
     expect(scope.vs.setcurClickItem).toHaveBeenCalled();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
     expect(scope.lvl.openEditArea).toHaveBeenCalled();
   });
   
  it('should setLastDblClick on Segment', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     elm.isolateScope().levelType = lvlType; 
     scope.vs.curViewPort.eS = (testitem.sampleStart + testitem.sampleDur + 1);
     spyOn(scope.vs, 'setcurClickLevel');
     spyOn(scope.vs, 'setcurClickItem');
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.vs, 'getPermission').and.returnValue(true);
     spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem});
     spyOn(scope.lvl, 'openEditArea');
     elm.isolateScope().setLastDblClick(0);
     expect(scope.vs.setcurClickLevel).toHaveBeenCalled();
     expect(scope.vs.setcurClickItem).toHaveBeenCalled();
     expect(scope.vs.setEditing).toHaveBeenCalledWith(true);
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
     expect(scope.lvl.openEditArea).toHaveBeenCalled();
   });

   it('should setLastMove', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     spyOn(scope.vs, 'setcurMouseLevelName');
     spyOn(scope.vs, 'setcurMouseLevelType');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.lvl, 'getClosestItem');
     elm.isolateScope().setLastMove(0, false);
     expect(scope.vs.setcurMouseLevelName).toHaveBeenCalled();
     expect(scope.vs.setcurMouseLevelType).toHaveBeenCalled();
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
   });

   it('should setLastMove with doChange', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     spyOn(scope.vs, 'setcurMouseLevelName');
     spyOn(scope.vs, 'setcurMouseLevelType');
     spyOn(scope.vs, 'setcurMouseItem');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.lvl, 'getClosestItem').and.returnValue({current: testitem, nearest: testitem});
     elm.isolateScope().setLastMove(0, true);
     expect(scope.vs.setcurMouseLevelName).toHaveBeenCalled();
     expect(scope.vs.setcurMouseLevelType).toHaveBeenCalled();
     expect(scope.vs.setcurMouseItem).toHaveBeenCalled();
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
   });
   

});
