'use strict';

describe('Directive: level', function () {

    var elm, tpl, scope, curLvl, curLvlE;
    var lvlName = 'Phonetic';
    var lvlNameE = 'Tone';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, LevelService, DataService, ConfigProviderService, viewState, fontScaleService) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.vs.curPerspectiveIdx = 0;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        scope.cps.design = defaultEmuwebappDesign;
        scope.font = fontScaleService;
        curLvl = scope.lvl.getLevelDetails(lvlName);
        curLvlE = scope.lvl.getLevelDetails(lvlNameE);
        scope.level = curLvl;
    }));

    function compileDirective(lvl) {
        tpl = "<level open='true' level='"+angular.toJson(lvl)+"'></level>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

   it('should have correct html', function () {
     compileDirective(curLvl);
     expect(elm.find('canvas').length).toBe(2);
     expect(elm.find('div').length).toBe(6);
     expect(elm.find('img').length).toBe(3);
   });

   it('should watch to vs.curViewPort', function () {
     scope.vs.curViewPort.windowWidth = 64;
     scope.vs.select(0,100);
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     scope.vs.curViewPort.windowWidth = 128;
     scope.vs.select(5,105);
     scope.$apply();
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
     expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalled();
   });

   it('should watch to vs.curMouseX', function () {
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.curMouseX = 10;
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     scope.vs.curMouseX = 20;
     scope.$apply();
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
     //expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalled();
   });

   it('should watch to vs.curClickLevelName', function () {
     scope.vs.setcurClickLevelName(lvlName,0);
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     scope.vs.setcurClickLevelName('Tone',1);
     scope.$apply();
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
   });

   it('should changeCurAttrDef', function () {
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('test');
     spyOn(scope.vs, 'setCurAttrDef');
     spyOn(scope.vs, 'setEditing');
     spyOn(scope.lvl, 'deleteEditArea');
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     elm.isolateScope().changeCurAttrDef('test1',0);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalled();
     expect(scope.vs.setCurAttrDef).toHaveBeenCalled();
     expect(scope.vs.setEditing).toHaveBeenCalled();
     expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
   });

   it('should getAttrDefBtnColor', function () {
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('test');
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     var ret = elm.isolateScope().getAttrDefBtnColor('test');
     expect(scope.vs.getCurAttrDef).toHaveBeenCalled();
     expect(ret).toEqual({
		'background': '-webkit-radial-gradient(50% 50%, closest-corner, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%)'
	 });
     ret = elm.isolateScope().getAttrDefBtnColor('test2');
     expect(scope.vs.getCurAttrDef).toHaveBeenCalled();
     expect(ret).toEqual({
		'background-color': 'white'
	 });
   });

   it('should updateView', function () {
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     elm.isolateScope().updateView();
     expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalled();
   });

   it('should drawLevelDetails', function () {
     compileDirective(curLvl);
     scope.vs.curViewPort.sS = 10;
     scope.vs.curViewPort.eS = 58089;
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue(lvlName);
     expect(elm.isolateScope()).toBeDefined();
     elm.isolateScope().drawLevelDetails();
   });

   it('should drawLevelDetails on EVENT', function () {
     compileDirective(curLvlE);
     scope.vs.curViewPort.sS = 10;
     scope.vs.curViewPort.eS = 58089;
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue(lvlName);
     spyOn(scope.font, 'drawUndistortedText').and.callThrough();
     expect(elm.isolateScope()).toBeDefined();
     elm.isolateScope().drawLevelDetails();
     expect(scope.font.drawUndistortedText).toHaveBeenCalled();
   });

   it('should clear on mouseleave', function () {
     compileDirective(curLvl);
     expect(elm.isolateScope()).toBeDefined();
     spyOn(scope.vs, 'setcurMouseItem');
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     elm.triggerHandler('mouseleave');
     expect(scope.vs.setcurMouseItem).toHaveBeenCalledWith(undefined, undefined, undefined);
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
   });

   it('should check preselected boundary on drawLevelMarkup (SEGMENT)', inject(function($rootScope) {
     compileDirective(curLvl);
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, false);
     spyOn(scope.vs, 'getPos');
     elm.isolateScope().redraw();
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));

   it('should check preselected boundary on drawLevelMarkup (EVENT)', inject(function($rootScope) {
     compileDirective(curLvl);
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('EVENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, false);
     spyOn(scope.vs, 'getPos');
     elm.isolateScope().redraw();
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));

   it('should check preselected boundary on drawLevelMarkup (first SEGMENT)', inject(function($rootScope) {
     compileDirective(curLvl);
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, true, false);
     spyOn(scope.vs, 'getPos');
     elm.isolateScope().redraw();
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));

   it('should check preselected boundary on drawLevelMarkup (last SEGMENT)', inject(function($rootScope) {
     compileDirective(curLvl);
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, true);
     spyOn(scope.vs, 'getPos');
     elm.isolateScope().redraw();
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));

   it('should drawLevelMarkup with multiple clicked segments', inject(function($rootScope) {
     compileDirective(curLvl);
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurClickLevelName(lvlName, 0);
     scope.vs.setcurClickItemMultiple(scope.lvl.getClosestItem(pcm, lvlName, 58089).current);
     scope.vs.setcurClickItemMultiple(scope.lvl.getClosestItem(pcm+600, lvlName, 58089).current);
     spyOn(scope.vs, 'getPos');
     elm.isolateScope().redraw();
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));


});
