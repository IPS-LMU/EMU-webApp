'use strict';

describe('Service: Binarydatamaniphelper', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var base64 = "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"; 
  
 /**
   *
   */
  it('should convert base64ToArrayBuffer', inject(function (Binarydatamaniphelper) {
      var ab = Binarydatamaniphelper.base64ToArrayBuffer(base64);   
      expect(ab.byteLength).toBe(2046);
  }));
   
 /**
   *
   */
  it('should convert arrayBufferToBase64', inject(function (Binarydatamaniphelper) {
      var base = Binarydatamaniphelper.arrayBufferToBase64(Binarydatamaniphelper.base64ToArrayBuffer(base64));   
      expect(base).toBe(base64);
  }));
   
});