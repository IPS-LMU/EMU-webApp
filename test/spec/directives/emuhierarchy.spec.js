'use strict';

describe('Directive: emuhierarchy', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, ConfigProviderService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
    }));

    function compileDirective() {
        var tpl = '<emuhierarchy></emuhierarchy>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }
    
    it('should have correct html', function () {
        compileDirective();
        expect(elm.find('svg').length).toBe(1);
    });    

});