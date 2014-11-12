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
/*
 disabled while reorganizing
 
    it('should have init text', function() {
        compileDirective();
        expect(elm.isolateScope()).toBeDefined();
        expect(elm.prevObject.html()).toContain('Drop your files here or click here to open a file');
        expect(elm.isolateScope().dropClass).toBe('');
    });


    it('should change state when dragover', function() {
        compileDirective();
        var e = $.Event('dragover');
        e.dx = 10;
        e.dy = 10;
        elm.prevObject.triggerHandler(e);
        scope.$apply();
        expect(elm.prevObject.html()).toContain('Drop files to start loading');
        expect(scope.dropText).toContain('Drop files to start loading');
        expect(scope.dropClass).toBe('over');
    });

    it('should change state back when dragleave', function() {
        compileDirective();
        var e = $.Event('dragover');
        e.dx = 10;
        e.dy = 10;
        elm.prevObject.triggerHandler(e);
        scope.$apply();
        var e = $.Event('dragleave');
        e.dx = 10;
        e.dy = 10;
        elm.prevObject.triggerHandler(e);
        scope.$apply();
        expect(scope.dropText).toContain('Drop your files here or click here to open a file');
        expect(scope.dropClass).toBe('');
    });

    it('should result in error when drop with no file', function() {
        compileDirective();
        var e = $.Event('drop');
        elm.prevObject.triggerHandler(e);
        scope.$apply();
        // nothing mocked : result in error
        expect(elm.prevObject.html()).toContain('Error: Could not parse file. The following file types are supported: .WAV .TEXTGRID');
        expect(scope.dropText).toContain('Error: Could not parse file. The following file types are supported: .WAV .TEXTGRID');
        expect(scope.dropClass).toBe('');
    });*/
       
});