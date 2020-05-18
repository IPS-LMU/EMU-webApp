'use strict';

describe('Directive: progressBar', function() {

    var elm, scope;
    
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        var tpl = '<progress-thing show-thing="'+val+'"></progress-thing>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$apply();
    }

    it('should have correct css classes', function() {
        compileDirective(true);
        expect(elm.prop('className')).toContain('emuwebapp-progressBar');
        expect(elm.prop('className')).toContain('emuwebapp-expandHeightTo20px');
        expect(elm.prop('className')).not.toContain('emuwebapp-shrinkHeightTo0px');
        compileDirective(false);
        expect(elm.prop('className')).toContain('emuwebapp-progressBar');
        expect(elm.prop('className')).toContain('emuwebapp-shrinkHeightTo0px');
        expect(elm.prop('className')).not.toContain('emuwebapp-expandHeightTo20px');
    });

       
});