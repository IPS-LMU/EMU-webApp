'use strict';



var headID = 'SSFF -- (c) SHLRC\n';
var machineID = 'Machine IBM-PC\n';
var sepString = '-----------------\n';

var ssffData = {};
ssffData.fileURL = '';
ssffData.sampleRate = -1;
ssffData.startTime = -1;
ssffData.origFreq = -1;
ssffData.Columns = [];


/**
 *
 */
ArrayBuffer.prototype.subarray = function (offset, length) {
	var sub = new ArrayBuffer(length);
	var subView = new Int8Array(sub);
	var thisView = new Int8Array(this);
	for (var i = 0; i < length; i++) {
		subView[i] = thisView[offset + i];
	}
	return sub;
};


/**
 * convert arraybuffer containing a wav file
 * to a javascript object
 * @param buf arraybuffer containing ssff file
 * @returns wav file javascript object
 */
function wav2jso(buf) {

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
	wavRep.ChunkID = String.fromCharCode.apply(null, curBufferView);
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
	wavRep.Format = String.fromCharCode.apply(null, curBufferView);
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
	wavRep.Subchunk1ID = String.fromCharCode.apply(null, curBufferView);
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
	wavRep.Subchunk2ID = String.fromCharCode.apply(null, curBufferView);
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

}

/**
 * add event listener to webworker
 */
self.addEventListener('message', function (e) {
	var data = e.data;
	switch (data.cmd) {
	case 'parseBuf':
		console.log(e)
		var parserRes = wav2jso(data.buffer);
		if (parserRes.status === undefined) {
			self.postMessage({
				'status': {
					'type': 'SUCCESS',
					'message': ''
				},
				'data': parserRes
			});
		} else {
			self.postMessage(parserRes);
		}
		break;
	}
});