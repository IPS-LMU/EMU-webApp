'use strict';

describe('Directive: myDropZone', function() {

    var elm, scope;
    beforeEach(module('emuwebApp', 'my.templates'));
    
    beforeEach(inject(function($rootScope, $compile, viewState, dialogService) {
        scope = $rootScope.$new();
        
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<my-drop-zone></my-drop-zone>';
        tpl = '<span>' + tpl + '</span>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$apply();
    }

    it('should have init text', function() {
        compileDirective();
        console.log(elem);
        //expect(scope.vs.curState).toBe(scope.vs.states.loadingSaving);
    });
});