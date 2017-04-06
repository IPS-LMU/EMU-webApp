'use strict';

describe('Service: Textgridparserservice', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q, Textgridparserservice) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred.resolve('called');  // always resolved, you can do it from your spec
  }));

  /**
   *
   */
   it('should resolve asyncToTextGrid', inject(function (Textgridparserservice, DataService) {
     var result;
     DataService.setData(msajc003_bndl.annotation);
     spyOn(Textgridparserservice, 'asyncToTextGrid').and.returnValue(deferred.promise);
     Textgridparserservice.asyncToTextGrid().then(function (res) {
       expect(res).toEqual('called');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncToTextGrid', inject(function (Textgridparserservice, DataService, Soundhandlerservice) {
     var result;
     Soundhandlerservice.audioBuffer.length = 1000;
     DataService.setData(msajc003_bndl.annotation);
     Textgridparserservice.asyncToTextGrid().then(function (res) {
       expect(res).toEqual('');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncParseTextGrid', inject(function (Textgridparserservice, DataService) {
   var result;
   DataService.setData(msajc003_bndl.annotation);
   spyOn(Textgridparserservice, 'asyncParseTextGrid').and.returnValue(deferred.promise);
   var ret = Textgridparserservice.asyncParseTextGrid('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('called');
   });
   scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncParseTextGrid', inject(function (Textgridparserservice, DataService) {
   var result;
   DataService.setData(msajc003_bndl.annotation);
   Textgridparserservice.asyncParseTextGrid('','','').then(function (res) { //esps, annotates, name
    expect(res).toEqual('');
   });
   scope.$apply();
   }));


});