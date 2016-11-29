'use strict';

describe('Directive: drawssff', function() {

    var elm, scope, worker;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, DataService, ConfigProviderService, LevelService, Ssffdataservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.design = defaultEmuwebappDesign;
        scope.vs = viewState;
        scope.data = DataService;
        scope.ssffds = Ssffdataservice; 
    }));
    
    afterEach(function() {
        scope.cps = {};
        scope.data = {};
        scope.ssffds = {};
    })
    
    function compileDirective(trackname) {
        var tpl = '<canvas width="2048" drawssff ssff-trackname="'+trackname+'"></canvas>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }
    
    function setData() {
        scope.vs.curPerspectiveIdx = 0;
        scope.ssffds.data = msajc003_bndl.ssffFiles[0].data;
		scope.data.setData(msajc003_bndl.annotation);
		scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].signalCanvases = aeDbConfig.EMUwebAppConfig.perspectives[0].signalCanvases;
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
    
    it('should watch vs.curViewPort (sS,eS)', function() {
        compileDirective('OSCI');
        scope.vs.curViewPort.eS = 10;
        scope.$apply();        
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'handleUpdate').and.returnValue();
        scope.vs.curViewPort.eS = 20;
        scope.$apply();
        expect(elm.isolateScope().handleUpdate).toHaveBeenCalled();
    }); 
    
    it('should watch vs.curViewPort (windowWidth)', function() {
        compileDirective('OSCI');
        scope.vs.curViewPort.windowWidth = 10;
        scope.$apply();        
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'handleUpdate').and.returnValue();
        scope.vs.curViewPort.windowWidth = 20;
        scope.$apply();
        expect(elm.isolateScope().handleUpdate).toHaveBeenCalled();
    }); 
    
    it('should watch vs.curViewPort (dragBarHeight)', function() {
        compileDirective('OSCI');
        scope.vs.curViewPort.dragBarHeight = 10;
        scope.$apply();        
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'handleUpdate').and.returnValue();
        scope.vs.curViewPort.dragBarHeight = 20;
        scope.$apply();
        expect(elm.isolateScope().handleUpdate).toHaveBeenCalled();
    });         

    it('should handleUpdate', function() {
        setData(); 
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: '1'});
        spyOn(scope.cps, 'getContourLimsOfTrack').and.returnValue(1);
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({values: [0, 1, 2]});
        spyOn(scope.ssffds, 'getSampleRateAndStartTimeOfTrack').and.returnValue(1);
        compileDirective('SPEC');
        expect(elm.isolateScope()).toBeDefined();
        elm.isolateScope().handleUpdate();
        expect(scope.cps.getContourLimsOfTrack).toHaveBeenCalledWith('test');
        expect(scope.cps.getSsffTrackConfig).toHaveBeenCalled();
        expect(scope.ssffds.getColumnOfTrack).toHaveBeenCalledWith('test', '1');
        expect(scope.ssffds.getSampleRateAndStartTimeOfTrack).toHaveBeenCalledWith('test');
    }); 

    it('should handleUpdate on other', function() {
        setData(); 
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: '1'});
        spyOn(scope.cps, 'getContourLimsOfTrack').and.returnValue(1);
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({values: [0, 1, 2]});
        spyOn(scope.ssffds, 'getSampleRateAndStartTimeOfTrack').and.returnValue(1);
        compileDirective('');
        expect(elm.isolateScope()).toBeDefined();
        elm.isolateScope().handleUpdate();
        expect(scope.cps.getContourLimsOfTrack).toHaveBeenCalledWith('test');
        expect(scope.cps.getSsffTrackConfig).toHaveBeenCalled();
        expect(scope.ssffds.getColumnOfTrack).toHaveBeenCalledWith('test', '1');
        expect(scope.ssffds.getSampleRateAndStartTimeOfTrack).toHaveBeenCalledWith('test');
    });  
    
    it('should drawValues', function() {
        setData();
        spyOn(scope.cps, 'getContourColorsOfTrack').and.returnValue(undefined);
        compileDirective('OSCI');
        expect(elm.isolateScope()).toBeDefined();
        spyOn(scope.vs, 'getViewPortStartTime').and.returnValue(0);
        spyOn(scope.vs, 'getViewPortEndTime').and.returnValue(10);
        elm.isolateScope().drawValues(scope.vs, elm[0], scope.cps, {values: [[0, 1, 2, 3]]}, 1, 0, 1, 1);
        expect(scope.cps.getContourColorsOfTrack).toHaveBeenCalled();
    });   
    
    it('should drawValues on SPEC', function() {
        setData();
        scope.vs.curCorrectionToolNr = 1;
        spyOn(scope.cps, 'getContourColorsOfTrack').and.returnValue(undefined);
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name : 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({ values: [0, 1, 2, 3]});
        spyOn(scope.ssffds, 'getSampleRateAndStartTimeOfTrack').and.returnValue({startTime: 0, smapleRate: 20000});
        compileDirective('SPEC');
        expect(elm.isolateScope()).toBeDefined();
        spyOn(scope.vs, 'getViewPortStartTime').and.returnValue(0);
        spyOn(scope.vs, 'getViewPortEndTime').and.returnValue(10);
        elm.isolateScope().assTrackName = 'FORMANTS';
        elm.isolateScope().drawValues(scope.vs, elm[0], scope.cps, {values: [[0, 1, 2, 3]]}, 1, 0, 1, 1);
        expect(scope.cps.getContourColorsOfTrack).toHaveBeenCalled();
    });
     
});
