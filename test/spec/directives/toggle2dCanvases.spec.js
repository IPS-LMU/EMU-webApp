'use strict';

describe('Directive: showTwod', function() {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<div show-twod="'+val+'"></div>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct css values', function() {
        compileDirective(true);
        expect(elm.prop('className')).toContain('.slideIn2dCanvases');
        compileDirective(false);
        expect(elm.prop('className')).not.toContain('.slideIn2dCanvases');
    });
});