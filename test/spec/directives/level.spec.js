'use strict';

describe('Directive: level', function () {

    var elm, tpl, scope, curLvl;
    beforeEach(module('emuwebApp', 'emuwebApp.templates'));

    beforeEach(inject(function ($rootScope, $compile, LevelService, ConfigProviderService) {
        scope = $rootScope.$new();
        scope.lvl = LevelService;
        scope.cps = ConfigProviderService;
        scope.cps.setVals(defaultEmuwebappConfig);
        scope.cps.curDbConfig = aeDbConfig;
        scope.lvl.setData(msajc003_bndl.annotation);
        curLvl = scope.lvl.getLevelDetails('Phonetic').level;
    }));

    function compileDirective() {
        tpl = "<level open='true' level='"+angular.toJson(curLvl)+"'></level>";
        inject(function ($compile) {
            elm = $compile(tpl)(scope);
        });
        scope.$digest();
    }

    it('should have correct html', function () {
        scope.level = curLvl;
        compileDirective();
        expect(elm.find('canvas').length).toBe(2);
        expect(elm.find('div').length).toBe(6);
        expect(elm.find('img').length).toBe(3);
    });
       

});