'use strict';

describe('Directive: drawssff', function() {

    var elm, scope, worker;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, DataService, ConfigProviderService, LevelService, Ssffdataservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.vs = viewState;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        scope.ssffds = Ssffdataservice;    
    }));
    
    function compileDirective(trackname) {
        var tpl = '<canvas width="2048" drawssff ssff-trackname="'+trackname+'"></canvas>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should set ssffTrackname', function() {
        compileDirective('OSCI');
        expect(elm.isolateScope()).toBeDefined();
        expect(elm.isolateScope().trackName).toBe('OSCI');
    });
    
    it('should watch vs.spectroSettings', function() {
        compileDirective('OSCI');
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'handleUpdate').and.returnValue();
        scope.vs.spectroSettings.windowLength = 2;
        scope.$apply();
        expect(elm.isolateScope().handleUpdate).toHaveBeenCalled();
    });  
    
    it('should watch vs.curViewPort', function() {
        compileDirective('OSCI');
        scope.vs.curViewPort.eS = 10;
        scope.$apply();        
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'handleUpdate').and.returnValue();
        scope.vs.curViewPort.eS = 20;
        scope.$apply();
        expect(elm.isolateScope().handleUpdate).toHaveBeenCalled();
    }); 

    /*it('should handleUpdate on other', function() {
        compileDirective('');
        scope.vs.curPerspectiveIdx = 0;
        scope.ssffds.data = {data: 'test'};
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'drawValues').and.returnValue();
        elm.isolateScope().handleUpdate();
        expect(elm.isolateScope().drawValues).toHaveBeenCalledWith('');
    }); */ 
});