'use strict';

describe('Worker: spectroDrawingWorker', function() {

  var worker, mockGlobal, wavData;
  
  var blob1, blob2, binary;

	var start = 2000;
	var end = 5000;
	var windowLength = 256;
	var window = 5;
	var width = 2048;
	var height = 150;
	var step = 28.36;
	var pixelRatio = 0.9;
	var sampleRate = 20000;
	var freq = 5000;
	var freqLow = 0;  
	var pcmpp = 1;  
  
  beforeEach(module('emuwebApp'));
  
  beforeEach(function(){
    var DummyWorker = function() {};
    worker = new spectroDrawingWorker(DummyWorker);    
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
			'message': 'Undefined message was sent to spectroDrawingWorker'
		}
	});
  });
  
  it('should respond properly to defined msg with unknown cmd', function() {
    mockGlobal.onmessage({data: {data: 'unknown'}});
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'heatMapColorAnchors is undefined'
		}
	});
  });
  
  it('should render spectro', function() {
    var wavData = [1,2,3,4];
    mockGlobal.onmessage({data: {
		'N': windowLength,
		'alpha': 0.16,
		'freq': freq,
		'freqLow': freqLow,
		'start': start,
		'end': end,
		'pcmpp': step,
		'window': window,
		'width': width,
		'height': height,
		'dynRangeInDB': 70,
		'pixelRatio': pixelRatio,
		'sampleRate': sampleRate,
		'streamChannels': 1,
		'transparency': 255,
		'stream': wavData,
		'drawHeatMapColors': false,
		'preEmphasisFilterFactor': 0.97,
		'heatMapColorAnchors': JSON.parse('[[255,0,0],[0,255,0],[0,0,0]]')
	}}, [wavData]);
    expect(mockGlobal.postMessage).toHaveBeenCalled();
  }); 

  
});