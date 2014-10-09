'use strict';

describe('Directive: dots', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, ConfigProviderService, Ssffdataservice) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.cps = ConfigProviderService;
        scope.ssffds = Ssffdataservice;    
    }));
    
    function compileDirective() {
        var tpl = '<dots></dots>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should be replaced correctly', function() {
        compileDirective();
        expect(elm.html()).toContain('<canvas width="512" height="512"></canvas>');
    });
});