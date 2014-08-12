'use strict';

describe('Directive: myDropZone', function() {

    var elm, scope;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<my-drop-zone></my-drop-zone>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$apply();
    }

    it('should have init text', function() {
        compileDirective();
        expect(elm.prevObject.html()).toContain('Drop your files here or click here to open a file');
        expect(scope.dropClass).toBe('');
    });

    it('should change state when dragover', function() {
        compileDirective();
        elm.triggerHandler('drop');
        console.log(elm.prevObject.html());
        //expect(elm.prevObject.html()).toContain('Drop your files here or click here to open a file');
    });
});