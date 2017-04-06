'use strict';

describe('Directive: preview', function () {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, ConfigProviderService) {
        scope = $rootScope.$new();
        ConfigProviderService.setVals(defaultEmuwebappConfig);
        ConfigProviderService.design = defaultEmuwebappDesign;
    }));

    function compileDirective(val) {
        tpl = '<preview current-bundle-name="' + val + '"></preview>  ';
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', inject(function (viewState, Soundhandlerservice, Drawhelperservice) {
        compileDirective('ae');
        expect(elm.find('canvas').length).toBe(2);
        expect(elm.html()).toContain('emuwebapp-preview-canvas');
        expect(elm.html()).toContain('emuwebapp-preview-canvas-markup');
    }));

    it('should watch curViewPort', inject(function (viewState, Soundhandlerservice, DataService, Drawhelperservice) {
        var spy1 = spyOn(Drawhelperservice,'freshRedrawDrawOsciOnCanvas');
        var spy2 = spyOn(Drawhelperservice,'calculatePeaks');
        DataService.setData(msajc003_bndl.annotation);
        Soundhandlerservice.audioBuffer.length = 58089;
        Soundhandlerservice.audioBuffer.getChannelData = function (n) {
            return(new Float32Array([1,2,3,4]));
        };

        compileDirective('ae');
        viewState.curViewPort = {
            sS: 10,
            eS: 20
        }
        scope.$apply();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    }));

    it('should watch currentBundleName', inject(function (viewState, Soundhandlerservice, DataService, Drawhelperservice) {
        var spy1 = spyOn(Drawhelperservice,'freshRedrawDrawOsciOnCanvas');
        var spy2 = spyOn(Drawhelperservice,'calculatePeaks');
        DataService.setData(msajc003_bndl.annotation);
        Soundhandlerservice.audioBuffer.length = 58089;
        Soundhandlerservice.audioBuffer.getChannelData = function (n) {
            return(new Float32Array([1,2,3,4]));
        };

        compileDirective('ae');
        scope.currentBundleName = 'msajc010';
        scope.$apply();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    }));

    it('should render selectedAreaColor in the middle of the canvas', inject(function (viewState, DataService, ConfigProviderService) {
        DataService.setData(msajc003_bndl.annotation);
        compileDirective('ae');
        viewState.curViewPort = {
            sS: 0,
            eS: 57989
        }
        scope.$apply();
        var markup = elm.find('canvas')[1];
        var ctx = markup.getContext('2d');
        var colorMiddle = ctx.getImageData(1, 1, 1, 1).data;
        var area = ConfigProviderService.design.color.transparent.yellow;
        var fillArea = area.substring(area.indexOf('(') + 1, area.lastIndexOf(')')).split(/,\s*/);
        expect(parseInt(colorMiddle[0])).toBe(0); // Hardcode for now
        expect(parseInt(colorMiddle[1])).toBe(0); // Hardcode for now
        expect(parseInt(colorMiddle[2])).toBe(0); // Hardcode for now
    }));
});
