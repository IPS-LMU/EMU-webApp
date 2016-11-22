'use strict';

describe('Directive: myDropZoneInput', function() {

    var elm, scope;
    
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));
    
    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
        scope.$parent.loadFiles = function() {};
    }));
     

    function compileDirective(tpl) {
        if (!tpl) tpl = '<my-drop-zone-input></my-drop-zone-input>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$apply();
    }

    it('should be hidden', function() {
        compileDirective();
        expect(elm.find('input').css('display')).toBe('none');
        expect(elm.find('input')[0].files.length).toBe(0);
    });

    it('should load Data', function() {
        compileDirective();
        spyOn(scope.$parent, 'loadFiles');
        elm.triggerHandler({
          type: 'change',
          target: {
            files: [ 'testFile' ]
          }
        });
        scope.$apply();
        expect(scope.$parent.loadFiles).toHaveBeenCalled();
    });

});