'use strict';

describe('Service: Espsparserservice', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q, Espsparserservice) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred.resolve('called');  // always resolved, you can do it from your spec
  }));

  /**
   *
   */
   it('should resolve asyncParseJSO', inject(function (Espsparserservice, LevelService) {
     var result;
     LevelService.setData(msajc003_bndl.annotation);
     spyOn(Espsparserservice, 'asyncParseJSO').and.returnValue(deferred.promise);
     Espsparserservice.asyncParseJSO('Utterance').then(function (res) {
       expect(res).toEqual('called');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseEsps', inject(function (Espsparserservice, LevelService) {
   var result;
   LevelService.setData(msajc003_bndl.annotation);
   spyOn(Espsparserservice, 'asyncParseEsps').and.returnValue(deferred.promise);
   var ret = Espsparserservice.asyncParseEsps('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('called');
   });
   scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseJSO', inject(function (Espsparserservice, LevelService) {
   var result;
   LevelService.setData(msajc003_bndl.annotation);
   spyOn(Espsparserservice, 'asyncParseJSO').and.returnValue(deferred.promise);
   var ret = Espsparserservice.asyncParseJSO('').then(function (res) { //name
    expect(res).toEqual('called');
   });
   scope.$apply();
   }));

});