'use strict';

describe('Service: Binarydatamaniphelper', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
 /**
   *
   */
  it('should convert base64ToArrayBuffer', inject(function (Binarydatamaniphelper) {
      var ab = Binarydatamaniphelper.base64ToArrayBuffer(base64Wav);   
      expect(ab.byteLength).toBe(2046);
  }));
   
 /**
   *
   */
  it('should convert arrayBufferToBase64', inject(function (Binarydatamaniphelper) {
      var base = Binarydatamaniphelper.arrayBufferToBase64(Binarydatamaniphelper.base64ToArrayBuffer(base64Wav));   
      expect(base).toBe(base64Wav);
  }));
   
});