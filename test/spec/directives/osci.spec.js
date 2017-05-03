'use strict';



describe('Directive: osci', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, Drawhelperservice, DataService, LevelService, ConfigProviderService, viewState, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.shs = Soundhandlerservice;
        scope.dhs = Drawhelperservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.cps.design = defaultEmuwebappDesign;
        scope.vs = viewState;
        scope.data = DataService;
        scope.data.setData(msajc003_bndl.annotation);
        scope.level = curLvl;

        scope.shs.audioBuffer.getChannelData = function (n) {
            var res = new Float32Array([1,2,3,4]);
            return(res);
        };
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

   it('should watch viewState.playHeadAnimationInfos', function () {
     scope.vs.playHeadAnimationInfos.sS = 1;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawPlayHead');
     scope.vs.playHeadAnimationInfos.sS = 10;
     scope.$digest();
     expect(elm.isolateScope().drawPlayHead).toHaveBeenCalled();
   });

   it('should watch viewState.movingBoundarySample', function () {
     scope.vs.movingBoundarySample = 1;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     scope.vs.movingBoundarySample = 10;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
   });
   
   it('should watch viewState.movingBoundary', function () {
     scope.vs.movingBoundary = false;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     scope.vs.movingBoundary = true;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
   });
   
   it('should watch viewState.curViewPort (same value)', function () {
     scope.vs.curViewPort.sS = 1;
     scope.vs.curViewPort.eS = 2;
     compileDirective();
     scope.shs.audioBuffer.length = 3;
     expect(elm.isolateScope()).toBeDefined();
     spyOn(elm.isolateScope(), 'drawVpOsciMarkup');
     spyOn(scope.dhs, 'calculatePeaks');
     spyOn(scope.dhs, 'freshRedrawDrawOsciOnCanvas');
     scope.vs.curViewPort.sS = 2;
     scope.vs.curViewPort.eS = 3;
     scope.$digest();
     expect(elm.isolateScope().drawVpOsciMarkup).toHaveBeenCalled();
     expect(scope.dhs.calculatePeaks).toHaveBeenCalled();
     expect(scope.dhs.freshRedrawDrawOsciOnCanvas).toHaveBeenCalled();
   });
});
