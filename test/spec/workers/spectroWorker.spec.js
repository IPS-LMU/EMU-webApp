'use strict';

describe('Worker: spectroWorker', function () {

  var worker;

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  it('should return error on undefined paramater', function (done) {
      worker = new Worker('scripts/workers/spectroWorker.js');
      worker.addEventListener('message', function (e) {
        expect(e.data.status.type).toEqual('ERROR');
        expect(e.data.status.message).toEqual('heatMapColorAnchors is undefined');
        worker.terminate();
        done();
      });
      worker.postMessage('');
  });
  
  /*it('should render a spectro image', function (done) {
      worker = new Worker('scripts/workers/spectroWorker.js');
      worker.addEventListener('message', function (e) {
        console.log(e.data);
        //expect(e.data).toEqual('Error: N is undefined');
        worker.terminate();
        done();
      });
      
      var parseData = '';
      
      worker.postMessage({
        'N': 256,
        'alpha': 0.16,
        'freq': 5000,
        'freqLow': 0,
        'start': 0,
        'end': 58089,
        'myStep': 28.3642578125,
        'window': 5,
        'width': 2048,
        'height': 150,
        'dynRangeInDB': 70,
        'pixelRatio': 0.8999999761581421,
        'sampleRate': 20000,
        'streamChannels': 1,
        'transparency': 255,
        'stream': parseData,
        'drawHeatMapColors': false,
        'preEmphasisFilterFactor': 0.97,
        'heatMapColorAnchors': JSON.parse('[[255,0,0],[0,255,0],[0,0,0]]')
      }, [parseData]);
  });  */

  

});