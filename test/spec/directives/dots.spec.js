'use strict';

describe('Directive: dots', function() {

    var elm, scope, worker;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, ConfigProviderService, LevelService, Ssffdataservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.lvl.setData(msajc003_bndl.annotation);
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

    it('should watch ssffds.data.length', function() {
        scope.vs.curPerspectiveIdx = 0;
        scope.ssffds.data = [{ssffTrackName: 'dftSpec', sampleRate: 200, startTime: 0.0025, origFreq: 20000, Columns: [0,1,2]}, {ssffTrackName: 'fundFreq', sampleRate: 200, startTime: 0.0025, origFreq: 20000, Columns: [0,1,2]}, {ssffTrackName: 'FORMANTS', sampleRate: 200, startTime: 0.0025, origFreq: 20000, Columns: [0,1,2]}];
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'drawDots');
        scope.$apply();
        expect(elm.isolateScope().drawDots).toHaveBeenCalled();
    });
});