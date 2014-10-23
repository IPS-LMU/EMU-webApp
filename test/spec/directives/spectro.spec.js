'use strict';

describe('Directive: spectro', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.lvl.setData(msajc003_bndl.annotation);
        scope.level = curLvl;
    }));

    function compileDirective() {
        tpl = "<spectro order='0' track-name='SPECTRO'></spectro>";
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
   
   /*

   it('should watch vs.timelineSize', inject(function ($timeout) {
    compileDirective();
    expect(elm.isolateScope()).toBeDefined();
    spyOn(elm.isolateScope(), 'redraw');
    spyOn(scope, 'redraw');
    scope.vs.timelineSize = 2;
    scope.$apply();
    $timeout.flush();
    expect(scope.redraw).toHaveBeenCalled();
    expect(elm.isolateScope().redraw).toHaveBeenCalled();
   }));  
   
   */    

});
