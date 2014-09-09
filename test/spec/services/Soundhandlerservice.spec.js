'use strict';

describe('Service: Soundhandlerservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
 /**
   *
   */
  it('should setPlayerSrc', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    Soundhandlerservice.setPlayerSrc(Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data));   
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + msajc003_bndl.mediaFile.data);
  }));
  
 /**
   *
   */
  it('should resetPlayerSrcFromTo', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    /*Soundhandlerservice.setPlayerSrc(Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data));   
    Soundhandlerservice.resetPlayerSrcFromTo(0,2000)
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + msajc003_bndl.mediaFile.data);
     subarray bug */
  }));
  
 /**
   *
   */
  it('should playFromTo', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    /*Soundhandlerservice.setPlayerSrc(Binarydatamaniphelper.base64ToArrayBuffer(base64Wav));   
    Soundhandlerservice.resetPlayerSrcFromTo(0,2000)
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + base64Wav);
     subarray bug */
  }));
});