'use strict';

describe('Worker: textGridParserWorker', function () {

  var worker;
  var level;
  var parsed;
  var sampleRate = 20000;
  var bufferLength = 58089;
  var name = 'msajc003';
  var annotates = name + '.wav';

  // load the controller's module
  beforeEach(module('emuwebApp'));

  beforeEach(inject(function (LevelService) {
    level = LevelService;
    var blob;
      try {
          blob = new Blob([textGridParserWorker], {type: 'application/javascript'});
      } catch (e) { // Backwards-compatibility
          window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
          blob = new BlobBuilder();
          blob.append(textGridParserWorker);
          blob = blob.getBlob();
     }
     if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
         worker = new Worker(webkitURL.createObjectURL(blob));
     } else {
         worker = new Worker(URL.createObjectURL(blob));
     } 

  }));

  it('should return error on unknown parameter', function (done) {
    worker.addEventListener('message', function (e) {
      expect(e.data.status.type).toEqual('ERROR');
      expect(e.data.status.message).toEqual('Unknown command sent to textGridParserWorker');
      worker.terminate();
      done();
    });
    worker.postMessage({
      'cmd': 'unknown'
    });
  });

  it('should convert toTextGrid', function (done) {
    level.setData(msajc003_bndl.annotation);
    worker.addEventListener('message', function (e) {
      expect(e.data.status.type).toEqual('SUCCESS');
      expect(e.data.status.message).toEqual('');
      //expect(e.data.data).toEqual(msajc003TextGridFile);
      worker.terminate();
      done();
    });
    worker.postMessage({
      'cmd': 'toTextGrid',
      'levels': level.getData().levels,
      'sampleRate': sampleRate,
      'buffLength': bufferLength
    });
  });


  it('should parseTG', function (done) {
    level.setData(msajc003_bndl.annotation);
    worker.addEventListener('message', function (e) {
      expect(e.data.status.type).toEqual('SUCCESS');
      expect(e.data.status.message).toEqual('');
      expect(e.data.data.name).toEqual(name);
      expect(e.data.data.annotates).toEqual(annotates);
      expect(e.data.data.sampleRate).toEqual(sampleRate);
      //expect(e.data.data.levels).toEqual(level.getLevelsByType(["EVENT", "SEGMENT"]));
      worker.terminate();
      done();
    });
    worker.postMessage({
      'cmd': 'parseTG',
      'textGrid': msajc003TextGridFileNew,
      'sampleRate': sampleRate,
      'annotates': annotates,
      'name': name
    });
  });

});