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
	var step = (end-start)/width;
	var pixelRatio = 1;
	var sampleRate = 20000;
	var freq = 5000;
	var freqLow = 0;
	var pcmpp = 1;
  var wavData = [];
  var HzStep = (sampleRate / 2) / (windowLength / 2);
  var pixelHeight = height / (Math.ceil(freq / HzStep) - Math.floor(freqLow / HzStep) - 2);


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

    if(wavData[1]===undefined) {
      for(var i=0;i<=windowLength+1;i++) {
        wavData[i]=i;
      }
    }

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

  it('should render spectro with BARTLETT', function() {
    window =1;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);
    //expect(mockGlobal.postMessage.calls.argsFor(0)[0].img).toEqual('');
  });

  it('should render spectro with BARTLETTHANN', function() {
    window = 2;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with BLACKMAN', function() {
    window = 3;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with COSINE', function() {
    window = 4;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with GAUSS', function() {
    window = 5;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with HAMMING', function() {
    window = 6;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with HANN', function() {
    window = 7;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with LANCZOS', function() {
    window = 8;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with RECTANGULAR', function() {
    window = 9;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with TRIANGULAR', function() {
    window = 10;
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
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });

  it('should render spectro with TRIANGULAR and HEATMAP', function() {
    window = 10;
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
		'drawHeatMapColors': true,
		'preEmphasisFilterFactor': 0.97,
		'heatMapColorAnchors': JSON.parse('[[255,0,0],[0,255,0],[0,0,0]]')
	}}, [wavData]);
    expect(mockGlobal.postMessage).toHaveBeenCalled();
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].window).toBe(window);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pcmpp).toBe((end-start)/width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].pixelHeight).toBe(pixelHeight);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].width).toBe(width);
    expect(mockGlobal.postMessage.calls.argsFor(0)[0].height).toBe(height);

  });


});
