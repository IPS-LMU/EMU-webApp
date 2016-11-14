'use strict';

describe('Service: Ssffparserservice', function () {
  var scope, deferred;

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (_$rootScope_, $q, Ssffparserservice) {
     scope = _$rootScope_;
     deferred = $q.defer();
     deferred.resolve('called');
  }));

  /**
   *
   */
   it('should resolve asyncParseSsffArr', inject(function (Ssffparserservice) {
     var result;
     spyOn(Ssffparserservice, 'asyncParseSsffArr').and.returnValue(deferred.promise);
     Ssffparserservice.asyncParseSsffArr([1, 2, 3]).then(function (res) {
       expect(res).toEqual('called');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncParseSsffArr', inject(function (Ssffparserservice) {
     var result;
     Ssffparserservice.asyncParseSsffArr([1, 2, 3]).then(function (res) {
       expect(res).toEqual('');
     });
     scope.$apply();
   }));

  /**
   *
   */
   it('should resolve asyncJso2ssff', inject(function (Ssffparserservice) {
   var result;
   spyOn(Ssffparserservice, 'asyncJso2ssff').and.returnValue(deferred.promise);
   var ret = Ssffparserservice.asyncJso2ssff({ }).then(function (res) {
    expect(res).toEqual('called');
   });
   scope.$apply();
   }));

  /**
   *
   */
   it('should do asyncJso2ssff', inject(function (Ssffparserservice) {
   var result;
   Ssffparserservice.asyncJso2ssff({ }).then(function (res) {
    expect(res).toEqual('');
   });
   scope.$apply();
   }));


});