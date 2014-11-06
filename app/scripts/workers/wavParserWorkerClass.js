/**
 * A simple class that creates another thread that responds to silly messages
 * with other silly messages. Okay, really it only knows 'mnah mnah'
 * @class wavParserWorker
 * @constructor
 * @param Worker {Worker} injection point for Worker
 */
function wavParserWorker(Worker) {
  Worker = Worker || window.Worker;
  this.url = this.getWorkerURL();
  this.worker = new Worker(this.url);
}
 
wavParserWorker.prototype = {
  // get the worker script in string format.
  getWorkerScript: function(){
    var js = '';
    js += '(' + this.workerInit + ')(this);';
    return js;
  },
 
  // This function really represents the body of our worker script.
  // The global context of the worker script will be passed in.
  workerInit: function(global) {

	//expand ArrayBuffer with subarray function
	ArrayBuffer.prototype.subarray = function (offset, length) {
		var sub = new ArrayBuffer(length);
		var subView = new Int8Array(sub);
		var thisView = new Int8Array(this);
		for (var i = 0; i < length; i++) {
			subView[i] = thisView[offset + i];
		}
		return sub;
	};	 	
	
	global.ab2str = function(ab) {
		var unis = [];
        for (var i = 0; i < ab.length; i++) {
          unis.push(ab[i]);
        }
        return String.fromCharCode.apply(null, unis);	
	}; 
    
	global.wav2jso = function(buf) {

		var wavRep = {};

		// var uIntBuffView = new Uint8Array(buf);

		var curBinIdx, curBuffer, curBufferView;

		// var dv = new DataView(buf);

		// var ChunkSize = dv.getUint32(4)
		// console.log(ChunkSize)

		// ChunkId == RIFF CHECK
		curBinIdx = 0;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint8Array(curBuffer);
        wavRep.ChunkID = global.ab2str(curBufferView);
        
		if (wavRep.ChunkID !== 'RIFF') {
			// console.error('Wav read error: ChunkID not RIFF. Got ' + wavRep.ChunkID);
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: ChunkID not RIFF but ' + wavRep.ChunkID
				}
			});
		}


		// ChunkSize
		curBinIdx = 4;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint32Array(curBuffer);
		wavRep.ChunkSize = curBufferView[0];
		// console.log(chunkSize)

		// Format == WAVE CHECK
		curBinIdx = 8;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint8Array(curBuffer);
		wavRep.Format = global.ab2str(curBufferView);
		if (wavRep.Format !== 'WAVE') {
			// console.error('Wav read error: Format not WAVE. Got ' + wavRep.Format);
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: Format not WAVE but ' + wavRep.Format
				}
			});
		}

		// Subchunk1ID == "fmt " CHECK
		curBinIdx = 12;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint8Array(curBuffer);
		wavRep.Subchunk1ID = global.ab2str(curBufferView);
		if (wavRep.Subchunk1ID !== 'fmt ') {
			// console.error('Wav read error: Subchunk1ID not fmt. Got ' + wavRep.Subchunk1ID);
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: Subchunk1ID not fmt  but ' + wavRep.Subchunk1ID
				}
			});
		}

		// Subchunk1Size == 16 CHECK
		curBinIdx = 16;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint32Array(curBuffer);
		wavRep.Subchunk1Size = curBufferView[0];
		if (wavRep.Subchunk1Size !== 16) {
			// console.error('Wav read error: Subchunk1Size not 16');
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: Subchunk1Size not 16 but ' + wavRep.Subchunk1Size
				}
			});
		}

		// AudioFormat == 1  CHECK
		curBinIdx = 20;
		curBuffer = buf.subarray(curBinIdx, 2);
		curBufferView = new Uint16Array(curBuffer);
		wavRep.AudioFormat = curBufferView[0];
		if (wavRep.AudioFormat !== 1) {
			// console.error('Wav read error: AudioFormat not 1');
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: AudioFormat not 1 but ' + wavRep.AudioFormat
				}
			});

		}

		// NumChannels == 1  CHECK
		curBinIdx = 22;
		curBuffer = buf.subarray(curBinIdx, 2);
		curBufferView = new Uint16Array(curBuffer);
		wavRep.NumChannels = curBufferView[0];
		// console.error('Wav read error: NumChannels not 1');
		if (wavRep.NumChannels !== 1) {
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: NumChannels not 1 but ' + wavRep.NumChannels
				}
			});
		}

		// SampleRate 
		curBinIdx = 24;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint32Array(curBuffer);
		wavRep.SampleRate = curBufferView[0];

		// ByteRate
		curBinIdx = 28;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint32Array(curBuffer);
		wavRep.ByteRate = curBufferView[0];

		// BlockAlign
		curBinIdx = 32;
		curBuffer = buf.subarray(curBinIdx, 2);
		curBufferView = new Uint16Array(curBuffer);
		wavRep.BlockAlign = curBufferView[0];

		// console.error(blockAlign);

		// BitsPerSample
		curBinIdx = 34;
		curBuffer = buf.subarray(curBinIdx, 2);
		curBufferView = new Uint16Array(curBuffer);
		wavRep.BitsPerSample = curBufferView[0];
		if (wavRep.BitsPerSample !== 16) {
			// console.error('Wav read error: NumChannels not 1');
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: BitsPerSample not 16 but ' + wavRep.BitsPerSample
				}
			});
		}

		// Subchunk2ID
		curBinIdx = 36;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint8Array(curBuffer);
		wavRep.Subchunk2ID = global.ab2str(curBufferView);
		if (wavRep.Subchunk2ID !== 'data') {
			// console.error('Wav read error: BitsPerSample not 16');
			return ({
				'status': {
					'type': 'ERROR',
					'message': 'Wav read error: Subchunk2ID not data but ' + wavRep.Subchunk2ID
				}
			});
		}

		// Subchunk2Size
		curBinIdx = 40;
		curBuffer = buf.subarray(curBinIdx, 4);
		curBufferView = new Uint32Array(curBuffer);
		wavRep.Subchunk2Size = curBufferView[0];

		// Data
		curBinIdx = 44;
		curBuffer = buf.subarray(curBinIdx, wavRep.Subchunk2Size);
		curBufferView = new Int16Array(curBuffer);
		wavRep.Data = curBufferView;
		// console.log(wavRep);

		// finally append original array buffer
		wavRep.origArrBuf = buf;
		return wavRep;
	};    
    
    global.onmessage = function(e) {
        if(e.data !== undefined) {
			switch (e.data.cmd) {
				case 'parseBuf':
					var parserRes = global.wav2jso(e.data.buffer);
					if (parserRes.status === undefined) {
						global.postMessage({
							'status': {
								'type': 'SUCCESS',
								'message': ''
							},
							'data': parserRes
						});
					} else {
						global.postMessage(parserRes);
					}
					break;
				default:
					global.postMessage({
						'status': {
							'type': 'ERROR',
							'message': 'Unknown command sent to wavParserWorker'
						}
					});
					break;
			}
		}
		else {
			global.postMessage({
				'status': {
					'type': 'ERROR',
					'message': 'Undefined message was sent to wavParserWorker'
				}
			});
		}
	};    
  },
 
  
  // get a blob url for the worker script from the worker script text
  getWorkerURL: function() {
    var blob, urlObj;
	try {
		blob = new Blob([this.getWorkerScript()], {type: 'application/javascript'});
	} catch (e) { // Backwards-compatibility
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		blob = new BlobBuilder();
		blob.append(textGridParserWorker);
		blob = blob.getBlob();
	}
	if (typeof URL !== 'object' && typeof webkitURL !== 'undefined') {
		urlObj = webkitURL.createObjectURL(blob);
	} else {
		urlObj = URL.createObjectURL(blob);
	} 
	return urlObj;
  },
 
 
  // kill the wavParserWorker
  kill: function() {
    if(this.worker) {
      this.worker.terminate();
    }
    if(this.url) {
      URL.revokeObjectURL(this.url);
    }
  },
  
  // say something to the wavParserWorker
  tell: function(msg) {
    if(this.worker) {
      this.worker.postMessage(msg);
    }
  },
  
  // listen for the wavParserWorker to talk back
  says: function(handler) {
    if(this.worker) {
      this.worker.addEventListener('message', function(e) {
        handler(e.data);
      });
    }
  },
};