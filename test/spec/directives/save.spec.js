'use strict';

describe('Directive: save', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $compile, viewState, dialogService, LevelService) {
        scope = $rootScope.$new();
        LevelService.setData(mockaeMsajc003);
        scope.level = mockaeMsajc003.levels[0];
        scope.vs = viewState;
        scope.dials = dialogService;
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