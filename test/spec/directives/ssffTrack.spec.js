'use strict';

describe('Directive: ssffTrack', function () {

    var elm, tpl, scope, curLvl;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function ($rootScope, $compile, Drawhelperservice, DataService, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.data = DataService;
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.dhs = Drawhelperservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
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
});