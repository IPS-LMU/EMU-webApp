'use strict';

describe('Worker: wavParserWorker', function () {

  var worker;
  var binary;
  var workerFile = 'scripts/workers/wavParserWorker.js';

  // load the controller's module
  beforeEach(module('emuwebApp'));
  
  beforeEach(inject(function (Binarydatamaniphelper) {
      binary = Binarydatamaniphelper;
  }));  
  
  it('should return error on unknown parameter', function (done) {
      worker = new Worker(workerFile);
      worker.addEventListener('message', function (e) {
          expect(e.data.status.type).toEqual('ERROR');
          expect(e.data.status.message).toEqual('Unknown command sent to wavParserWorker');
          worker.terminate();
          done();
      });
      worker.postMessage({
        'cmd': 'unknown'
      });
  }); 
   
  it('should parse ArrayBuffer to WAVE', function (done) {
      worker = new Worker(workerFile);
      worker.addEventListener('message', function (e) {
          expect(e.data.status.type).toEqual('SUCCESS');
          expect(e.data.status.message).toEqual('');
          expect(e.data.data.ChunkID).toEqual('RIFF');
          expect(e.data.data.ChunkSize).toEqual(116214);
          expect(e.data.data.Format).toEqual('WAVE');
          expect(e.data.data.Subchunk1ID).toEqual('fmt ');  // <-- SIC why spaces ?
          expect(e.data.data.Subchunk1Size).toEqual(16);
          expect(e.data.data.AudioFormat).toEqual(1);
          expect(e.data.data.NumChannels).toEqual(1);
          expect(e.data.data.SampleRate).toEqual(20000);
          expect(e.data.data.ByteRate).toEqual(40000);
          expect(e.data.data.BlockAlign).toEqual(2);
          expect(e.data.data.BitsPerSample).toEqual(16);
          expect(e.data.data.Subchunk2ID).toEqual('data');
          expect(e.data.data.Subchunk2Size).toEqual(116178);
          expect(e.data.data.Data.length).toEqual(58089);
          worker.terminate();
          done();
      });
      var buf = binary.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
	  worker.postMessage({
		'cmd': 'parseBuf',
		'buffer': buf
	  }, [buf]);
  });
  

});