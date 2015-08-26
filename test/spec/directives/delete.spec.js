'use strict';

describe('Directive: delete', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState) {
        scope = $rootScope.$new();
        scope.level = new Object();
        scope.level = msajc003_bndl.annotation.levels[0];
        scope.vs = viewState;
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<div delete="0"></div>';
        tpl = '<span>' + tpl + '</span>';
        inject(function($compile) {
            var form = $compile(tpl)(scope);
            elm = form.find('div');
        });
        scope.$digest();
    }

    it('should be clickable', function() {
        compileDirective();
        elm.triggerHandler('click');
        //scope.$digest();
        expect(scope.vs.curClickLevelName).toEqual('Utterance');
        expect(scope.vs.curState).toBe(scope.vs.states.loadingSaving);
    });
});
