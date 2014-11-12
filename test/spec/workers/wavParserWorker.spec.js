'use strict';

describe('Worker: wavParserWorker', function() {

  var worker, mockGlobal, wavData;
  
  beforeEach(module('emuwebApp'));
  
  beforeEach(function(){
    var DummyWorker = function() {};
    worker = new wavParserWorker(DummyWorker);    
    // mock the global scope for the worker thread.
    mockGlobal = {
      postMessage: jasmine.createSpy('postMessage')
    };
    // call the initWorker method we use to build the worker script.
    worker.workerInit(mockGlobal);
  });
  
 
  it('should respond properly to undefined msg', function() {
    mockGlobal.onmessage('unknown');
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'Undefined message was sent to wavParserWorker'
		}
	});
  });
  
  it('should respond properly to defined msg with unknown cmd', function() {
    mockGlobal.onmessage({data: {cmd: 'unknown'}});
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'Unknown command sent to wavParserWorker'
		}
	});
  });
  
  it('should respond properly to defined msg with defined cmd and data', inject(function (Binarydatamaniphelper) {
    var ab = Binarydatamaniphelper.base64ToArrayBuffer(msajc003_bndl.mediaFile.data);
    mockGlobal.onmessage({data: {cmd: 'parseBuf', 'buffer': ab}}, [ab]);
    expect(mockGlobal.postMessage).toHaveBeenCalled();
    // need real test data in order to check correct wav parsing
  }));
  
});