'use strict';

describe('Directive: handleglobalkeystrokes', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, ConfigProviderService, viewState) {
        scope = $rootScope.$new();
        scope.cps = ConfigProviderService;
        scope.vs = viewState;
    }));

    function compileDirective() {
        var tpl = '<span><div handleglobalkeystrokes></div></span>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$digest();
    }

    it('should zoomAll', function(Soundhandlerservice) {
        scope.cps.setVals(defaultEmuwebappConfig);
        Soundhandlerservice.wavJSO.Data = new Array(58089);
        var spy1 = spyOn(scope.vs, 'getPermission').and.returnValue(true);
        var spy2 = spyOn(scope.vs, 'setViewPort');
        compileDirective();
        var e = jQuery.Event('keypress');
        e.which = scope.cps.vals.keyMappings.zoomAll;
        e.keyCode = scope.cps.vals.keyMappings.zoomAll; 
        e.shiftKey = false;       
        $(document).trigger(e);
        expect(obj.method).toHaveBeenCalledWith('zoom');
        expect(spy2).toHaveBeenCalled();        
    });
});