'use strict';

describe('Directive: slideToggle', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, ConfigProviderService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.cps = ConfigProviderService;
    }));

    function compileDirective(toggleOpen) {
        var tpl = '<div data-slide-toggle="'+toggleOpen+'" data-slide-toggle-duration="250"><span>test</span></div>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$digest();
    }

    it('should toggle on slideToggle', function() {
        compileDirective(false);
        expect(elm.prevObject[0].style.cssText).toEqual('display: block;');
        compileDirective(true);
        expect(elm.prevObject[0].style.cssText).toEqual('');
    });

});