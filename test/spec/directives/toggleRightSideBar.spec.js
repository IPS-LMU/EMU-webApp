'use strict';

describe('Directive: showMenu', function() {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<div show-menu="'+val+'"></div>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct css values', function() {
        compileDirective(true);
        expect(elm.prop('className')).toContain('emuwebapp-expandWidthTo200px');
        expect(elm.prop('className')).not.toContain('emuwebapp-shrinkWidthTo0px');
        compileDirective(false);
        expect(elm.prop('className')).toContain('emuwebapp-shrinkWidthTo0px');
        expect(elm.prop('className')).not.toContain('emuwebapp-expandWidthTo200px');
    });
});