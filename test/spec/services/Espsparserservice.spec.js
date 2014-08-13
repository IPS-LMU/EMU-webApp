'use strict';

describe('Service: Espsparserservice', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function(_$rootScope_, $q, Espsparserservice) {
    scope = _$rootScope_;
    deferred = $q.defer();
    deferred.resolve('called'); //  always resolved, you can do it from your spec
    spyOn(Espsparserservice, 'asyncParseJSO').andReturn(deferred.promise); 
    spyOn(Espsparserservice, 'asyncParseEsps').andReturn(deferred.promise); 
  }));
  
 /**
   *
   */
  it('should resolve asyncParseJSO', inject(function (Espsparserservice, LevelService) {
     var result;
     LevelService.setData(mockaeMsajc003);
     //spyOn(Espsparserservice, 'asyncParseJSO').and.returnValue(deferred.promise);
     var ret = Espsparserservice.asyncParseJSO('Utterance').then(function (res) {
      expect(res).toEqual('called');
     });
     scope.$apply();
  }));
   
 /**
   *
   */
  it('should resolve asyncParseEsps', inject(function (Espsparserservice, LevelService) {
     var result;
     LevelService.setData(mockaeMsajc003);
     //spyOn(Espsparserservice, 'asyncParseJSO').and.returnValue(deferred.promise);
     var ret = Espsparserservice.asyncParseEsps('','','').then(function (res) {
      expect(res).toEqual('called');
     });
     scope.$apply();
  }));
  
});