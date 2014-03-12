'use strict';

angular.module('emuwebApp')
	.service('Wavparserservice', function Wavparserservice(viewState) {
		// AngularJS will instantiate a singleton by calling "new" on this function
		// shared service object
		var sServObj = {};

		sServObj.vs = viewState;

		sServObj.ssffData = {};

		sServObj.headID = 'SSFF -- (c) SHLRC\n';
		sServObj.machineID = 'Machine IBM-PC\n';
		sServObj.sepString = '-----------------\n';

		sServObj.ssffData.fileURL = '';
		sServObj.ssffData.sampleRate = -1;
		sServObj.ssffData.startTime = -1;
		sServObj.ssffData.origFreq = -1;
		sServObj.ssffData.Columns = [];


		/**
		 * convert arraybuffer containing a wav file
		 * to a javascript object
		 * @param buf arraybuffer containing ssff file
		 * @returns wav file javascript object
		 */
		sServObj.wav2jso = function (buf) {

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
				console.error('Wav read error: ChunkID not RIFF. Got ' + wavRep.ChunkID);
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
				console.error('Wav read error: Format not WAVE. Got ' + wavRep.Format);
			}

			// Subchunk1ID == "fmt " CHECK
			curBinIdx = 12;
			curBuffer = buf.subarray(curBinIdx, 4);
			curBufferView = new Uint8Array(curBuffer);
			wavRep.Subchunk1ID = String.fromCharCode.apply(null, curBufferView);
			if (wavRep.Subchunk1ID !== 'fmt ') {
				console.error('Wav read error: Subchunk1ID not fmt. Got ' + wavRep.Subchunk1ID);
			}

			// Subchunk1Size == 16 CHECK
			curBinIdx = 16;
			curBuffer = buf.subarray(curBinIdx, 4);
			curBufferView = new Uint32Array(curBuffer);
			wavRep.Subchunk1Size = curBufferView[0];
			if (wavRep.Subchunk1Size !== 16) {
				console.error('Wav read error: Subchunk1Size not 16');
			}

			// AudioFormat == 1  CHECK
			curBinIdx = 20;
			curBuffer = buf.subarray(curBinIdx, 2);
			curBufferView = new Uint16Array(curBuffer);
			wavRep.AudioFormat = curBufferView[0];
			if (wavRep.AudioFormat !== 1) {
				console.error('Wav read error: AudioFormat not 1');
			}

			// NumChannels == 1  CHECK
			curBinIdx = 22;
			curBuffer = buf.subarray(curBinIdx, 2);
			curBufferView = new Uint16Array(curBuffer);
			wavRep.NumChannels = curBufferView[0];
			if (wavRep.NumChannels !== 1) {
				console.error('Wav read error: NumChannels not 1');
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
				console.error('Wav read error: NumChannels not 1');
			}

			// Subchunk2ID
			curBinIdx = 36;
			curBuffer = buf.subarray(curBinIdx, 4);
			curBufferView = new Uint8Array(curBuffer);
			wavRep.Subchunk2ID = String.fromCharCode.apply(null, curBufferView);
			if (wavRep.Subchunk2ID !== 'data') {
				console.error('Wav read error: BitsPerSample not 16');
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


		/**
		 * helper function to convert string to Uint8Array
		 * @param string
		 */
		// sServObj.stringToUint = function (string) {};

		/**
		 *
		 */
		// sServObj.Uint8Concat = function (first, second) {};

		return sServObj;

	});