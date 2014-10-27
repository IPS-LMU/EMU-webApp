'use strict';

describe('Directive: historyActionPopup', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $q, $compile, viewState, dialogService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.dials = dialogService;
    }));

    function compileDirective(tpl) {
        inject(function($compile) {
            elm = $compile('<history-action-popup ng-show="vs.historyActionTxt !=\'\'"></history-action-popup>')(scope);
        });
        scope.$digest();
    }
    
    it('should be replaced correctly', function() {
        compileDirective(true);
        expect(elm.hasClass('emuwebapp-historyActionPopup')).toBe(true);
    });
   
   it('should watch vs.historyActionTxt', inject(function ($animate) {
        scope.vs.historyActionTxt = '';
        compileDirective();
        scope.vs.historyActionTxt = 'warning';
        scope.$apply();
        expect(elm.hasClass('emuwebapp-historyActionPopupThere')).toBe(true);
   }));
});