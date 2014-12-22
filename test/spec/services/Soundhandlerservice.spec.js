'use strict';

describe('Service: Soundhandlerservice', function () {

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  var b64;
  
 /**
   *
   */
  it('should setPlayerSrc', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    b64 = Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
    Soundhandlerservice.setPlayerSrc(b64);   
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + msajc003_bndl.mediaFile.data);
  }));
  
 /**
   *
   */
  it('should resetPlayerSrcFromTo', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    // phantomjs does not support subarray() 
    /*Soundhandlerservice.setPlayerSrc(b64);   
    Soundhandlerservice.resetPlayerSrcFromTo(0,2000)
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + msajc003_bndl.mediaFile.data);
    no subarray in phantomjs bug */
  }));
  
 /**
   *
   */
  it('should playFromTo', inject(function (Soundhandlerservice, Binarydatamaniphelper) {
    /*Soundhandlerservice.setPlayerSrc(b64);   
    Soundhandlerservice.resetPlayerSrcFromTo(0,2000)
    expect(Soundhandlerservice.player.src).toEqual('data:audio/wav;base64,' + base64Wav);
    no subarray in phantomjs bug */
  }));
});