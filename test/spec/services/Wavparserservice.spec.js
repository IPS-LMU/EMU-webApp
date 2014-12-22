'use strict';

describe('Service: Wavparserservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function () {
  }));
  
  var item;
  
  /**
   *
   */
   it('should do parseWavArrBuf', inject(function (Wavparserservice) {
     var result;
     Wavparserservice.parseWavArrBuf([1, 2, 3]).then(function (res) {
       expect(res).toEqual('');
     });
   }));

});