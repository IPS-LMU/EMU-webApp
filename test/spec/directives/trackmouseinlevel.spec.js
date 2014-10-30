'use strict';

describe('Directive: trackmouseinlevel', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    var lvlType = 'SEGMENT';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, Soundhandlerservice, LevelService, ConfigProviderService, viewState) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.vs = viewState;
        scope.shs = Soundhandlerservice;
        scope.lvl.setData(msajc003_bndl.annotation);
        curLvl = scope.lvl.getLevelDetails(lvlName).level;
        scope.level = curLvl;
    }));

    function compileDirective() {
        tpl = '<canvas width="2048" height="64" track-mouse-in-level level-name="'+curLvl.name+'" level-type="'+curLvl.type+'"></canvas>';
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

   it('should setLastMove', function () {
     scope.shs.wavJSO.Data = new Array(58089);
     compileDirective();
     spyOn(scope.vs, 'setcurMouseLevelName');
     spyOn(scope.vs, 'setcurMouseLevelType');
     spyOn(scope.vs, 'getX').and.returnValue(1);
     spyOn(scope.vs, 'getSamplesPerPixelVal').and.returnValue(1);
     spyOn(scope.lvl, 'getClosestItem');
     elm.isolateScope().setLastMove(0, false);
     expect(scope.vs.setcurMouseLevelName).toHaveBeenCalled();
     expect(scope.vs.setcurMouseLevelType).toHaveBeenCalled();
     expect(scope.lvl.getClosestItem).toHaveBeenCalled();
   });
   

});
