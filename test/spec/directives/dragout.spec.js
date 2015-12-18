'use strict';

describe('Directive: dragout', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, loadedMetaDataService, ConfigProviderService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.cps = ConfigProviderService;
        scope.cps.vals.main = {};
        scope.cps.vals.main.comMode = 'embedded';        
        scope.vs.curPerspectiveIdx = 0;
        scope.lmds = loadedMetaDataService;
    }));

    function compileDirective(bundleName) {
        var tpl = '<div dragout draggable="true" name="'+bundleName+'"></div>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }
    
    it('should check if is active', function() {
        var curBundleName = 'test';
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName);
        expect(elm.isolateScope()).toBeDefined();
        expect(elm.isolateScope().isActive()).toBe(true);
    });
    
    it('should generateURL', function() {
        var curBundleName = 'test';
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName);
        expect(elm.isolateScope()).toBeDefined();
        expect(elm.isolateScope().generateURL().substr(0,12)).toEqual('blob:http://');
    });

    it('should allow dragout on active', function() {
        var curBundleName = 'test';
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName);
        var event = document.createEvent('Event');
        event.initEvent('mousedown', true, true);
        elm[0].dispatchEvent(event);
        expect(elm[0].draggable).toBe(true);
    });

    it('should disallow dragout on active', function() {
        var curBundleName = 'test';
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName + '1');
        var event = document.createEvent('Event');
        event.initEvent('mousedown', true, true);
        elm[0].dispatchEvent(event);
        expect(elm[0].draggable).toBe(true);
    });

    it('should stop css on dragend', function() {
        var curBundleName = 'test';
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName);
        var event = document.createEvent('Event');
        event.initEvent('dragend', true, true);
        elm[0].dispatchEvent(event);
        expect(elm[0].classList).not.toEqual('drag');
    });

    it('should generate url on dragstart', function() {
        var curBundleName = 'test';        
        scope.lmds.setCurBndlName(curBundleName);
        compileDirective(curBundleName);
        spyOn(elm.isolateScope(), 'generateURL');
        var event = document.createEvent('Event');
        event.initEvent('dragstart', true, true);
        elm[0].dispatchEvent(event);
        expect(elm.isolateScope().generateURL).toHaveBeenCalled();
     });

});