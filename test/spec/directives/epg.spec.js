'use strict';



describe('Directive: epg', function () {

    var elm, scope, tpl;
    beforeEach(module('emuwebApp'));
    
    beforeEach(inject(function ($rootScope, $compile, viewState, fontScaleService, ConfigProviderService, Ssffdataservice, Soundhandlerservice) {
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.ssffds = Ssffdataservice;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.design = defaultEmuwebappDesign;
        scope.shs = Soundhandlerservice;
        scope.shs.wavJSO = {};
        scope.shs.wavJSO.SampleRate = 1000;
        scope.fontImage = fontScaleService;
        scope.vs = viewState;
    }));

    function compileDirective() {
        tpl = "<epg></epg>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', function () {
        compileDirective();
        expect(elm.find('canvas').length).toBe(1);
    });


    it('should watch vs.timelineSize', inject(function ($timeout) {
        scope.ssffds.data = [1];
		var img = document.createElement('canvas');
		img.setAttribute('width',Math.round(200));
		img.setAttribute('height',Math.round(100));
        spyOn(scope.cps, 'getSsffTrackConfig').and.returnValue({name: 'test', columnName: 'test'});
        spyOn(scope.ssffds, 'getColumnOfTrack').and.returnValue({values: [[1, 2, 3]]});
        spyOn(scope.ssffds, 'getSampleRateAndStartTimeOfTrack').and.returnValue({sampleRate: 2, startTime: 1});
        spyOn(scope.fontImage, 'getTextImageTwoLines').and.returnValue(img);
        scope.vs.curViewPort.eS = 10;
        compileDirective();
        scope.vs.curViewPort.eS = 100;
        scope.$apply();
        expect(scope.fontImage.getTextImageTwoLines).toHaveBeenCalled();
    }));

});
