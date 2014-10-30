'use strict';



describe('Directive: osci', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, Drawhelperservice, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.dhs = Drawhelperservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.lvl.setData(msajc003_bndl.annotation);
        scope.level = curLvl;
    }));

    function compileDirective() {
        tpl = "<osci order='0' track-name='OSCI'></osci>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

   it('should have correct html', function () {
     compileDirective();
     expect(elm.isolateScope()).toBeDefined();
     expect(elm.find('canvas').length).toBe(3);
     expect(elm.find('div').length).toBe(3);
     expect(elm.find('img').length).toBe(1);
   });
   

});
