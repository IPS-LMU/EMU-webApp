'use strict';

describe('Directive: bundleListSideBar', function() {

    var elm, tpl, scope;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
    }));

    function compileDirective(val) {
        tpl = '<bundle-list-side-bar is-open="{{vs.submenuOpen}}"></bundle-list-side-bar>';
        inject(function($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct css values', inject(function (viewState) {
        scope.filterText = '';
        scope.bundleList = [];
        scope.vs = viewState;
        scope.vs.submenuOpen = true;
        compileDirective();
        expect(elm.prop('className')).not.toContain('ng-hide');
        scope.vs.submenuOpen = false;
        compileDirective();
        expect(elm.prop('className')).not.toContain('ng-hide');
    }));
    

    it('should have correct html values', inject(function (viewState) {
        scope.filterText = '';
        scope.bundleList = [];
        scope.vs = viewState;
        scope.vs.submenuOpen = true;
        compileDirective();
        expect(elm.html()).toContain('<div class="emuwebapp-bundleFilter">');
        expect(elm.html()).toContain('input');
        expect(elm.html()).toContain('my-drop-zone');
        expect(elm.html()).toContain('my-drop-zone-input');
    }));
    
    
    
});