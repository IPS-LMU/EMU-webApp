'use strict';

describe('Worker: ssffParserWorker', function () {

  var worker;
  var binary;
  var workerFile = 'scripts/workers/ssffParserWorker.js';

  // load the controller's module
  beforeEach(module('emuwebApp'));


  it('should return error on unknown parameter', function (done) {
    worker = new Worker(workerFile);
    worker.addEventListener('message', function (e) {
      expect(e.data.status.type).toEqual('ERROR');
      expect(e.data.status.message).toEqual('Unknown command sent to ssffParserWorker');
      worker.terminate();
      done();
    });
    worker.postMessage({
      'cmd': 'unknown'
    });
  });

  if (navigator.userAgent.match(/PhantomJS/i) === false) { // phantomjs no support for Float64Array =(
    it('should parse Arr to ssffJsoArr', function (done) {
      worker = new Worker(workerFile);
      worker.addEventListener('message', function (e) {
        expect(e.data.status.type).toEqual('SUCCESS');
        expect(e.data.status.message).toEqual('');
        expect(e.data.data.length).toEqual(3);

        expect(e.data.data[0].ssffTrackName).toEqual('dftSpec');
        expect(e.data.data[0].sampleRate).toEqual(200);
        expect(e.data.data[0].startTime).toEqual(0.0025);
        expect(e.data.data[0].origFreq).toEqual(20000);
        expect(e.data.data[0].Columns[0].name).toEqual('dft');
        expect(e.data.data[0].Columns[0].ssffdatatype).toEqual('FLOAT');
        expect(e.data.data[0].Columns[0].length).toEqual(257);
        expect(e.data.data[0].Columns[0]._minVal).toEqual(-61.62375259399414); // SIC ..how to calculate manual if these vals are correct ?
        expect(e.data.data[0].Columns[0]._maxVal).toEqual(71.21517944335938); // SIC ..how to calculate manual if these vals are correct ?

        expect(e.data.data[1].ssffTrackName).toEqual('fundFreq');
        expect(e.data.data[1].sampleRate).toEqual(200);
        expect(e.data.data[1].startTime).toEqual(0.0025);
        expect(e.data.data[1].origFreq).toEqual(20000);
        expect(e.data.data[1].Columns[0].name).toEqual('F0');
        expect(e.data.data[1].Columns[0].ssffdatatype).toEqual('FLOAT');
        expect(e.data.data[1].Columns[0].length).toEqual(1);
        expect(e.data.data[1].Columns[0]._minVal).toEqual(0); // SIC ..how to calculate manual if these vals are correct ?
        expect(e.data.data[1].Columns[0]._maxVal).toEqual(145.5271759033203); // SIC ..how to calculate manual if these vals are correct ?


        expect(e.data.data[2].ssffTrackName).toEqual('FORMANTS');
        expect(e.data.data[2].sampleRate).toEqual(200);
        expect(e.data.data[2].startTime).toEqual(0.0025);
        expect(e.data.data[2].origFreq).toEqual(20000);
        expect(e.data.data[2].Columns[0].name).toEqual('rms');
        expect(e.data.data[2].Columns[0].ssffdatatype).toEqual('DOUBLE');
        expect(e.data.data[2].Columns[0].length).toEqual(1);
        //expect(e.data.data[2].Columns[0]._minVal).toEqual(0); // SIC ..how to calculate manual if these vals are correct ?
        //expect(e.data.data[2].Columns[0]._maxVal).toEqual(75.11538857050633); // SIC ..how to calculate manual if these vals are correct ?
        expect(e.data.data[2].Columns[1].name).toEqual('gain');
        expect(e.data.data[2].Columns[1].ssffdatatype).toEqual('DOUBLE');
        expect(e.data.data[2].Columns[1].length).toEqual(1);
        expect(e.data.data[2].Columns[1]._minVal).toEqual(0); // SIC ..how to calculate manual if these vals are correct ?
        //expect(e.data.data[2].Columns[1]._maxVal).toEqual(61.32775073014245); // SIC ..how to calculate manual if these vals are correct ?
        expect(e.data.data[2].Columns[2].name).toEqual('fm');
        expect(e.data.data[2].Columns[2].ssffdatatype).toEqual('DOUBLE');
        expect(e.data.data[2].Columns[2].length).toEqual(4);
        //expect(e.data.data[2].Columns[2]._minVal).toEqual(0); // SIC ..how to calculate manual if these vals are correct ?
        //expect(e.data.data[2].Columns[2]._maxVal).toEqual(4210); // SIC ..how to calculate manual if these vals are correct ?
        expect(e.data.data[2].Columns[3].name).toEqual('bw');
        expect(e.data.data[2].Columns[3].ssffdatatype).toEqual('DOUBLE');
        expect(e.data.data[2].Columns[3].length).toEqual(4);
        expect(e.data.data[2].Columns[3]._minVal).toEqual(0); // SIC ..how to calculate manual if these vals are correct ?
        //expect(e.data.data[2].Columns[3]._maxVal).toEqual(1486); // SIC ..how to calculate manual if these vals are correct ?

        worker.terminate();
        done();
      });
      var buf = msajc003_bndl.ssffFiles;
      worker.postMessage({
        'cmd': 'parseArr',
        'ssffArr': buf
      });
    });
  }
});