'use strict';

describe('Directive: ssffTrack', function () {

    var elm, tpl, scope, curLvl;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function ($rootScope, $compile, Ssffdataservice, Drawhelperservice, DataService, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.data = DataService;
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.dhs = Drawhelperservice;
        scope.ssffds = Ssffdataservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.cps.design = defaultEmuwebappDesign;
        scope.vs = viewState;
        scope.data.setData(msajc003_bndl.annotation);
        scope.level = curLvl;           
    }));

    function compileDirective() {
        tpl = "<ssff-track track-name='SSFF' order='2'></ssff-track>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', function () {
        compileDirective();
        expect(elm.find('canvas').length).toBe(3);
        expect(elm.find('div').length).toBe(4);
        expect(elm.find('img').length).toBe(1);
    });
    

    it('should drawSsffTrackMarkup', function () {
        compileDirective();
        spyOn(scope.dhs, 'drawMovingBoundaryLine');
        spyOn(scope.dhs, 'drawCurViewPortSelected');
        spyOn(scope.dhs, 'drawMinMaxAndName');
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({_minVal: 0, _maxVal: 10});
        spyOn(scope.cps, 'getValueLimsOfTrack').and.returnValue({minVal: 50, maxVal: 100});
        scope.ssffds.data = [1, 2, 3, 4, 5];
        scope.drawSsffTrackMarkup();
        expect(scope.dhs.drawMovingBoundaryLine).toHaveBeenCalled();
        expect(scope.dhs.drawCurViewPortSelected).toHaveBeenCalled();
        expect(scope.dhs.drawMinMaxAndName).toHaveBeenCalled();
        expect(scope.cps.getSsffTrackConfig).toHaveBeenCalled();
        expect(scope.ssffds.getColumnOfTrack).toHaveBeenCalled();
    });
    
    
    
    
});
