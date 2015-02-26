'use strict';

describe('Directive: save', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, modalService, DataService) {
        scope = $rootScope.$new();
        DataService.setData(msajc003_bndl.annotation);
        scope.level = msajc003_bndl.annotation.levels[0];
        scope.vs = viewState;
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<div save="0"></div>';
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
        expect(scope.vs.curClickLevelName).toEqual('Utterance');
        expect(scope.vs.curClickLevelIndex).toEqual('0');
    });
});