'use strict';

describe('Directive: showMenu', function() {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective() {
        tpl = '<canvas previewtrack></canvas>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should set correct click values', inject(function (viewState, Soundhandlerservice) {
        Soundhandlerservice.audioBuffer.length = 58089;
        viewState.curViewPort = {
          sS : 20,
          eS : 120
        }
        expect(viewState.curViewPort.sS).toBe(20);
        expect(viewState.curViewPort.eS).toBe(120);
        compileDirective();
        var e = $.Event('click');
        e.offsetX = 10;
        e.originalEvent = {
          layerX : 10,
          target : {
            width : 100,
            clientWidth : 100
          }
        }
        elm.triggerHandler(e);
        scope.$apply();
        // viewState.setViewPort(((10) * (100 / 100) * (58089 / 100) - 50), ((10) * (100 / 100) * (58089 / 100) + 50));
        // -> viewState.setViewPort(5758.9, 5858.9)
        expect(viewState.curViewPort.sS).toBe(5759);
        expect(viewState.curViewPort.eS).toBe(5859);
    }));
    

    it('should set correct mousemove values', inject(function (viewState, Soundhandlerservice) {
        Soundhandlerservice.audioBuffer.length = 58089;
        viewState.curViewPort = {
          sS : 20,
          eS : 120
        }
        expect(viewState.curViewPort.sS).toBe(20);
        expect(viewState.curViewPort.eS).toBe(120);
        compileDirective();
        var e = $.Event('click');
        e.offsetX = 10;
        e.originalEvent = {
          layerX : 10,
          target : {
            width : 100,
            clientWidth : 100
          }
        }
        elm.triggerHandler(e);
        scope.$apply();
        var e = $.Event('mousemove');
        e.which = 1;
        e.buttons = 1;
        e.offsetX = 15;
        e.originalEvent = {
          layerX : 15,
          target : {
            width : 100,
            clientWidth : 100
          }
        }
        elm.triggerHandler(e);
        scope.$apply();
        // viewState.setViewPort(((15) * (100 / 100) * (58089 / 100) - 50), ((15) * (100 / 100) * (58089 / 100) + 50));
        // -> viewState.setViewPort(8663.35, 8763.35)
        expect(viewState.curViewPort.sS).toBe(8663);
        expect(viewState.curViewPort.eS).toBe(8763);
        
    }));    
});