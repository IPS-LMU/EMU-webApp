'use strict';

describe('Directive: dots', function() {

    var elm, scope, worker;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, ConfigProviderService, DataService, LevelService, Ssffdataservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.vs = viewState;
        scope.vs.curPerspectiveIdx = 0;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        scope.ssffds = Ssffdataservice;    
    }));
    
    function compileDirective() {
        var tpl = '<dots></dots>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should be replaced correctly', function() {
        compileDirective();
        expect(elm.html()).toContain('<canvas width="512" height="512"></canvas>');
    });
    
    it('should setGlobalMinMaxVals', function() {
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({_minVal: 1, _maxVal: 2});
        scope.cps.vals.perspectives[scope.vs.curPerspectiveIdx].twoDimCanvases.twoDimDrawingDefinitions = [ {dots: [1, 2]} ];
        elm.isolateScope().setGlobalMinMaxVals();
    });    
    
   /* it('should drawDots', function() {
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({_minVal: 1, _maxVal: 2, values: [[1, 2], [2, 3]]});
        elm.isolateScope().drawDots();
    }); */   

    it('should watch ssffds.data.length', function() {
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'drawDots').and.returnValue();
        scope.ssffds.data = [{ssffTrackName: 'dftSpec', sampleRate: 200, startTime: 0.0025, origFreq: 20000, Columns: [0,1,2]}];
        scope.$apply();
        expect(elm.isolateScope().drawDots).toHaveBeenCalled();
    });

    it('should watch vs.curViewPort', function() {
        compileDirective();
        scope.ssffds.data = [{ssffTrackName: 'dftSpec', sampleRate: 200, startTime: 0.0025, origFreq: 20000, Columns: [0,1,2]}];
        scope.vs.select(0,100);
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'drawDots').and.returnValue();
        scope.vs.select(90,200);
        scope.$apply();
        expect(elm.isolateScope().drawDots).toHaveBeenCalled();
    });
});