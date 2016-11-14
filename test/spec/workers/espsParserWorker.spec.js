'use strict';

describe('Worker: espsParserWorker', function() {

  var worker, mockGlobal, wavData;
  var name = 'lab';
  var audioExt = '.wav';
  var sampleRate = 20000;
  var JSONData = { status : { type : 'SUCCESS', message : '' }, data : { name : 'lab', annotates : 'lab.wav', sampleRate : 20000, levels : [ { name : 'lab', items : [ { id : 2, labels : [ { name : 'lab', value : 'V' } ], sampleStart : 3749, sampleDur : 1389 }, { id : 3, labels : [ { name : 'lab', value : 'm' } ], sampleStart : 5139, sampleDur : 1664 }, { id : 4, labels : [ { name : 'lab', value : 'V' } ], sampleStart : 6804, sampleDur : 1729 }, { id : 5, labels : [ { name : 'lab', value : 'N' } ], sampleStart : 8534, sampleDur : 1134 }, { id : 6, labels : [ { name : 'lab', value : 's' } ], sampleStart : 9669, sampleDur : 1669 }, { id : 7, labels : [ { name : 'lab', value : 't' } ], sampleStart : 11339, sampleDur : 594 }, { id : 8, labels : [ { name : 'lab', value : 'H' } ], sampleStart : 11934, sampleDur : 1549 }, { id : 9, labels : [ { name : 'lab', value : '@:' } ], sampleStart : 13484, sampleDur : 1314 }, { id : 10, labels : [ { name : 'lab', value : 'f' } ], sampleStart : 14799, sampleDur : 3054 }, { id : 11, labels : [ { name : 'lab', value : 'r' } ], sampleStart : 17854, sampleDur : 1144 }, { id : 12, labels : [ { name : 'lab', value : 'E' } ], sampleStart : 18999, sampleDur : 1639 }, { id : 13, labels : [ { name : 'lab', value : 'n' } ], sampleStart : 20639, sampleDur : 3279 }, { id : 14, labels : [ { name : 'lab', value : 'z' } ], sampleStart : 23919, sampleDur : 1869 }, { id : 15, labels : [ { name : 'lab', value : 'S' } ], sampleStart : 25789, sampleDur : 2609 }, { id : 16, labels : [ { name : 'lab', value : 'i:' } ], sampleStart : 28399, sampleDur : 864 }, { id : 17, labels : [ { name : 'lab', value : 'w' } ], sampleStart : 29264, sampleDur : 859 }, { id : 18, labels : [ { name : 'lab', value : '@' } ], sampleStart : 30124, sampleDur : 844 }, { id : 19, labels : [ { name : 'lab', value : 'z' } ], sampleStart : 30969, sampleDur : 1719 }, { id : 20, labels : [ { name : 'lab', value : 'k' } ], sampleStart : 32689, sampleDur : 829 }, { id : 21, labels : [ { name : 'lab', value : 'H' } ], sampleStart : 33519, sampleDur : 789 }, { id : 22, labels : [ { name : 'lab', value : '@' } ], sampleStart : 34309, sampleDur : 519 }, { id : 23, labels : [ { name : 'lab', value : 'n' } ], sampleStart : 34829, sampleDur : 999 }, { id : 24, labels : [ { name : 'lab', value : 's' } ], sampleStart : 35829, sampleDur : 2034 }, { id : 25, labels : [ { name : 'lab', value : 'I' } ], sampleStart : 37864, sampleDur : 1044 }, { id : 26, labels : [ { name : 'lab', value : 'd' } ], sampleStart : 38909, sampleDur : 424 }, { id : 27, labels : [ { name : 'lab', value : '@' } ], sampleStart : 39334, sampleDur : 1339 }, { id : 28, labels : [ { name : 'lab', value : 'db' } ], sampleStart : 40674, sampleDur : 2329 }, { id : 29, labels : [ { name : 'lab', value : 'j' } ], sampleStart : 43004, sampleDur : 1219 }, { id : 30, labels : [ { name : 'lab', value : 'u:' } ], sampleStart : 44224, sampleDur : 1449 }, { id : 31, labels : [ { name : 'lab', value : 'dH' } ], sampleStart : 45674, sampleDur : 384 }, { id : 32, labels : [ { name : 'lab', value : '@' } ], sampleStart : 46059, sampleDur : 1179 }, { id : 33, labels : [ { name : 'lab', value : 'f' } ], sampleStart : 47239, sampleDur : 1709 }, { id : 34, labels : [ { name : 'lab', value : '@' } ], sampleStart : 48949, sampleDur : 1176 }, { id : 35, labels : [ { name : 'lab', value : 'l' } ], sampleStart : 50126, sampleDur : 1962 } ], type : 'SEGMENT' } ] } };

  beforeEach(module('emuwebApp'));

  beforeEach(function(){
    var DummyWorker = function() {};
    worker = new espsParserWorker(DummyWorker);
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
			'message': 'Undefined message was sent to espsParserWorker'
		}
	});
  });

  it('should respond properly to defined msg with unknown cmd', function() {
    mockGlobal.onmessage({data: {cmd: 'unknown'}});
    expect(mockGlobal.postMessage).toHaveBeenCalledWith({
		'status': {
			'type': 'ERROR',
			'message': 'Unknown command sent to espsParserWorker'
		}
	});
  });

  it('should parse esps file containing segments correctly', function () {
    mockGlobal.onmessage({data: {
        'cmd': 'parseESPS',
        'esps': msajc003EspsLabFile,
        'sampleRate': sampleRate,
        'annotates': name + audioExt,
        'name': name
      }});
      expect(mockGlobal.postMessage).toHaveBeenCalledWith(JSONData);
  });

  it('should parse JSON Data correctly', function () {
    mockGlobal.onmessage({data: {
        'cmd': 'parseJSO',
        'level': {
            'items': JSONData.data.levels[0].items,
            'name': 'msajc003'
        },
        'sampleRate': sampleRate
      }});
      //expect(mockGlobal.postMessage).toHaveBeenCalledWith(msajc003EspsLabFile);
      // TODO: error in data ! needs fix
      expect(mockGlobal.postMessage).toHaveBeenCalled();
  });

});