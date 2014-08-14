'use strict';

describe('Directive: preview', function() {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<preview current-bundle-name="'+val+'"></preview>  ';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', inject(function (viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService) {
        compileDirective();
        expect(elm.find('canvas').length).toBe(2);
        expect(elm.html()).toContain('emuwebapp-previewCanvasContainer');
        expect(elm.html()).toContain('emuwebapp-previewCanvas');
        expect(elm.html()).toContain('emuwebapp-previewMarkupCanvas');
    }));

    it('should watch curViewPort', inject(function (viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService) {
        var spy = spyOn(Drawhelperservice, 'freshRedrawDrawOsciOnCanvas');
        Soundhandlerservice.wavJSO.Data = new Array(58089); 
        ConfigProviderService.setVals(configProviderServiceData);
        viewState.curViewPort = {
          sS : 20,
          eS : 120
        }
        compileDirective('test');
        viewState.curViewPort = {
          sS : 30,
          eS : 90
        }    
        scope.$apply(); 
        expect(spy).toHaveBeenCalled();
    }));

    it('should watch currentBundleName', inject(function (viewState, Soundhandlerservice, Drawhelperservice, ConfigProviderService) {
        var spy = spyOn(Drawhelperservice, 'freshRedrawDrawOsciOnCanvas');
        Soundhandlerservice.wavJSO.Data = new Array(58089); 
        ConfigProviderService.setVals(configProviderServiceData);
        viewState.curViewPort = {
          sS : 20,
          eS : 120
        }
        compileDirective('test');
        scope.currentBundleName = 'test2';   
        scope.$apply(); 
        expect(spy).toHaveBeenCalled();
    }));

    it('should render selectedAreaColor in the middle of the canvas', inject(function (viewState, Soundhandlerservice, ConfigProviderService) {
        Soundhandlerservice.wavJSO.Data = new Array(58089); 
        ConfigProviderService.setVals(configProviderServiceData);
        viewState.curViewPort = {
          sS : 0,
          eS : 58089
        }
        compileDirective('test');    
        var markup = elm.find('canvas')[1];
        var ctx = markup.getContext('2d');
        var posS = (markup.width / Soundhandlerservice.wavJSO.Data.length) * viewState.curViewPort.sS;
        var posE = (markup.width / Soundhandlerservice.wavJSO.Data.length) * viewState.curViewPort.eS;
        var colorMiddle = ctx.getImageData(markup.width/2, markup.height/2, 1, 1).data;
        var area = ConfigProviderService.vals.colors.selectedAreaColor;
        var fillArea = area.substring(area.indexOf('(') + 1, area.lastIndexOf(')')).split(/,\s*/);
        expect(parseInt(fillArea[0])).toBe(colorMiddle[0]);
        expect(parseInt(fillArea[1])).toBe(colorMiddle[1]);
        expect(parseInt(fillArea[2])).toBe(colorMiddle[2]);
        expect(Math.floor(fillArea[3]*255)).toBe(colorMiddle[3]);
    }));
});