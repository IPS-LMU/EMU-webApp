'use strict';

describe('Directive: resize', function() {

    var elm, form, span, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<form><span><span></span><span></span><span></span><div resize></div></span></form>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
            form = form.find('form');
            span = form.find('span');
        });
        scope.$digest();
    }

    it('should be clickable (true)', inject(function (ConfigProviderService) {
        scope.cps = ConfigProviderService;
        scope.updateView = function() {};
        scope.cps.setVals(configProviderServiceData);
        scope.cps.vals.activeButtons.deleteSingleLevel = true;
        scope.cps.vals.activeButtons.saveSingleLevel = true;
        scope.open = true;
        compileDirective();
        elm.triggerHandler('click');
        expect(scope.open).not.toBeTruthy();
        expect(elm.prevObject.css('height')).toEqual('30px');
        expect(elm.prevObject.children().children()[0].style.display).toEqual('none');
        expect(elm.prevObject.children().children()[2].style.display).toEqual('none');
    })); 

    it('should be clickable (false)', inject(function (ConfigProviderService) {
        scope.cps = ConfigProviderService;
        scope.updateView = function() {};
        scope.cps.setVals(configProviderServiceData);
        scope.cps.vals.activeButtons.deleteSingleLevel = true;
        scope.cps.vals.activeButtons.saveSingleLevel = true;
        scope.open = true;
        compileDirective();
        elm.triggerHandler('click');
        elm.triggerHandler('click');
        expect(scope.open).toBeTruthy();
        expect(elm.prevObject.css('height')).not.toEqual('30px');
        expect(elm.prevObject.children().children()[0].style.display).not.toEqual('none');
        expect(elm.prevObject.children().children()[2].style.display).not.toEqual('none');
    })); 
});