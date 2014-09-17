'use strict';

describe('Service: Binarydatamaniphelper', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));

  /**
   *
   */
  it('should convert base64ToArrayBuffer', inject(function (Binarydatamaniphelper) {
    var ab = Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
    expect(ab.byteLength).toBe(msajc003_bndl.mediaFile.data.length * 0.75 - 1);
  }));

  /**
   *
   */
  it('should convert arrayBufferToBase64', inject(function (Binarydatamaniphelper) {
    var base = Binarydatamaniphelper.arrayBufferToBase64(Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data));
    expect(base).toBe(msajc003_bndl.mediaFile.data);
  }));

});