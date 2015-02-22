'use strict';

describe('Service: Wavparserservice', function () {

  var scope;
  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function (_$rootScope_) {
      scope = _$rootScope_;
  }));
  
  /**
   *
   */
   it('should do parseWavArrBuf', inject(function (Binarydatamaniphelper, Wavparserservice) {
     var ab = Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
     Wavparserservice.parseWavArrBuf(ab).then(function (res) {
       console.log(res);
       expect(res).toEqual('');
     });
     scope.$digest();
   }));

});