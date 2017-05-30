'use strict';

describe('Worker: TextGridParserWorker', function() {

  var worker, mockGlobal, wavData;
  
  beforeEach(module('emuwebApp'));
  
  var data;
  var parsed;
  var sampleRate = 20000;
  var bufferLength = 58089;
  var name = 'msajc003';
  var annotates = name + '.wav';
  
  beforeEach(inject(function (DataService) {
    data = DataService;
    var DummyWorker = function() {};
    worker = new TextGridParserWorker(DummyWorker);
    // mock the global scope for the worker thread.
    mockGlobal = {
      postMessage: jasmine.createSpy('postMessage')
    };
    // call the initWorker method we use to build the worker script.
    worker.workerInit(mockGlobal);
  }));
  
 
  it('should respond properly to undefined msg', function() {
    mockGlobal.onmessage('unknown');
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'Undefined message was sent to TextGridParserWorker'
		}
	});
  });
  
  it('should respond properly to defined msg with unknown cmd', function() {
    mockGlobal.onmessage({data: {cmd: 'unknown'}});
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'Unknown command sent to TextGridParserWorker'
		}
	});
  });
  
  it('should convert toTextGrid', function() {
    data.setData(msajc003_bndl.annotation);
    mockGlobal.onmessage({data: {
      'cmd': 'toTextGrid',
      'levels': data.getData().levels,
      'sampleRate': sampleRate,
      'buffLength': bufferLength
    }});
    expect(mockGlobal.postMessage).toHaveBeenCalled();    
    // todo: need data to compare!
  });
  
  it('should parse TG', function() {
    data.setData(msajc003_bndl.annotation);
    mockGlobal.onmessage({data: {
      'cmd': 'parseTG',
      'textGrid': msajc003TextGridFileNew,
      'sampleRate': sampleRate,
      'annotates': annotates,
      'name': name
    }});
    expect(mockGlobal.postMessage).toHaveBeenCalled();
    // todo: need data to compare!
  });
  

});