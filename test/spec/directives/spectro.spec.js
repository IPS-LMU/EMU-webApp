'use strict';



describe('Directive: spectro', function () {

    var elm, tpl, scope, curLvl;
    var lvlName = 'Phonetic';
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
        scope.cps.design = defaultEmuwebappDesign;
        scope.vs = viewState;
        scope.data.setData(msajc003_bndl.annotation);
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

    it('should watch vs.curViewPort', inject(function ($timeout) {
        scope.shs.wavJSO.Data = {};
        compileDirective();
        scope.vs.curViewPort.sS = 1;
        scope.$apply();
        expect(elm.isolateScope()).toBeDefined();
        spyOn(elm.isolateScope(), 'clearAndDrawSpectMarkup');
        scope.vs.curViewPort.sS = 10;
        scope.$apply();
        expect(elm.isolateScope().clearAndDrawSpectMarkup).toHaveBeenCalled();
    }));

    it('should killSpectroRenderingThread', function () {
        compileDirective();
        spyOn(scope.dhs, 'drawCurViewPortSelected');
        elm.isolateScope().killSpectroRenderingThread();
        expect(scope.dhs.drawCurViewPortSelected).toHaveBeenCalled();
    });

    it('should drawSpectro', function () {
        compileDirective();
        scope.shs.wavJSO.Data = [1, 2, 3];
        spyOn(elm.isolateScope(), 'killSpectroRenderingThread');
        spyOn(elm.isolateScope(), 'startSpectroRenderingThread');
        elm.isolateScope().drawSpectro(scope.shs.wavJSO.Data);
        expect(elm.isolateScope().killSpectroRenderingThread).toHaveBeenCalled();
        expect(elm.isolateScope().startSpectroRenderingThread).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should return correct value for calcSamplesPerPxl', function () {
        scope.vs.curViewPort.eS = 2048;
        scope.vs.curViewPort.sS = 1;
        compileDirective();
        // (2048 + 1 - 1) / 2
        expect(elm.isolateScope().calcSamplesPerPxl()).toBe(1);
    });

    it('should startSpectroRenderingThread', function () {
        compileDirective();
        scope.vs.curViewPort.sS = 4000;
        var buffer = new ArrayBuffer(58089);
        var view = new Uint8Array(buffer);
        //spyOn(ArrayBuffer.prototype, 'subarray');
        spyOn(elm.isolateScope(), 'setupEvent');
        elm.isolateScope().startSpectroRenderingThread(view);
        expect(elm.isolateScope().setupEvent).toHaveBeenCalled();
    });

});
