'use strict';

describe('Directive: level', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, LevelService, DataService, ConfigProviderService, viewState) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        curLvl = scope.lvl.getLevelDetails(lvlName).level;
        scope.level = curLvl;
    }));

    function compileDirective() {
        tpl = "<level open='true' level='"+angular.toJson(curLvl)+"'></level>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

   it('should have correct html', function () {
     compileDirective();
     expect(elm.find('canvas').length).toBe(2);
     expect(elm.find('div').length).toBe(6);
     expect(elm.find('img').length).toBe(3);
   });
   
   it('should react to $broadcast refreshTimeline', inject(function($rootScope) {
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     $rootScope.$broadcast('refreshTimeline');
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalledWith(curLvl, scope.vs, scope.cps);
     expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalledWith(curLvl, scope.vs, scope.cps);
   }));
   
   it('should watch to vs.curViewPort', function () {
     scope.vs.curViewPort.windowWidth = 64;
     scope.vs.select(0,100);
     compileDirective();
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
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     scope.vs.curMouseX = 20;
     scope.$apply();
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
     expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalled();
   }); 
   
   it('should watch to vs.curClickLevelName', function () {
     scope.vs.setcurClickLevelName(lvlName,0);
     compileDirective();
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
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     elm.isolateScope().changeCurAttrDef('test1',0);
     expect(scope.vs.getCurAttrDef).toHaveBeenCalled();
     expect(scope.vs.setCurAttrDef).toHaveBeenCalled();
     expect(scope.vs.setEditing).toHaveBeenCalled();
     expect(scope.lvl.deleteEditArea).toHaveBeenCalled();
   });
       
   it('should getAttrDefBtnColor', function () {
     spyOn(scope.vs, 'getCurAttrDef').and.returnValue('test');
     compileDirective();
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
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawLevelDetails');
     elm.isolateScope().updateView();
     expect(elm.isolateScope().drawLevelDetails).toHaveBeenCalled();
   });
       
   it('should clear on mouseleave', function () {
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     spyOn(scope.vs, 'setcurMouseItem');
     spyOn(elm.isolateScope(), 'drawLevelMarkup');
     elm.trigger('mouseleave');
     expect(scope.vs.setcurMouseItem).toHaveBeenCalledWith(undefined, undefined, undefined);
     expect(elm.isolateScope().drawLevelMarkup).toHaveBeenCalled();
   });
       
   it('should check preselected boundary on drawLevelMarkup (SEGMENT)', inject(function($rootScope) {
     compileDirective();
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, false);
     spyOn(scope.vs, 'getPos');
     $rootScope.$broadcast('refreshTimeline');
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));
       
   it('should check preselected boundary on drawLevelMarkup (EVENT)', inject(function($rootScope) {
     compileDirective();
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('EVENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, false);
     spyOn(scope.vs, 'getPos');
     $rootScope.$broadcast('refreshTimeline');
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));
       
   it('should check preselected boundary on drawLevelMarkup (first SEGMENT)', inject(function($rootScope) {
     compileDirective();
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, true, false);
     spyOn(scope.vs, 'getPos');
     $rootScope.$broadcast('refreshTimeline');
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));
       
   it('should check preselected boundary on drawLevelMarkup (last SEGMENT)', inject(function($rootScope) {
     compileDirective();
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurMouseLevelName(lvlName);
     scope.vs.setcurMouseLevelType('SEGMENT');
     var seg = scope.lvl.getClosestItem(pcm, lvlName, 58089);
     var neigh = scope.lvl.getItemNeighboursFromLevel(lvlName, seg.nearest.id, seg.nearest.id);
     scope.vs.setcurMouseItem(seg.nearest, neigh, pcm, false, true);
     spyOn(scope.vs, 'getPos');
     $rootScope.$broadcast('refreshTimeline');
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));
       
   it('should drawLevelMarkup with multiple clicked segments', inject(function($rootScope) {
     compileDirective();
     var pcm = 4504;
     expect(elm.isolateScope()).toBeDefined();
     scope.vs.setcurClickLevelName(lvlName, 0);
     scope.vs.setcurClickItemMultiple(scope.lvl.getClosestItem(pcm, lvlName, 58089).current);
     scope.vs.setcurClickItemMultiple(scope.lvl.getClosestItem(pcm+600, lvlName, 58089).current);
     spyOn(scope.vs, 'getPos');
     $rootScope.$broadcast('refreshTimeline');
     expect(scope.vs.getPos).toHaveBeenCalled();
   }));
          

});
