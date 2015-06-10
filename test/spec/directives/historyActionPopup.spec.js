'use strict';

describe('Directive: historyActionPopup', function() {

    var elm, scope;
    beforeEach(module('emuwebApp'));

    beforeEach(inject(function($rootScope, $q, $compile, viewState, modalService) {
        scope = $rootScope.$new();
        scope.vs = viewState;
        scope.modal = modalService;
    }));

    function compileDirective(tpl) {
        inject(function($compile) {
            elm = $compile('<history-action-popup></history-action-popup>')(scope);
        });
        scope.$digest();
    }

    it('should be replaced correctly', function() {
        compileDirective(true);
        expect(elm.hasClass('emuwebapp-history')).toBe(true);
    });

});
