'use strict';

angular.module('emuwebApp')
	.service('Soundhandlerservice', function Soundhandlerservice($document) {

		// private vars
		var audioContext;
		var curSource;

		// shared service object
		var sServObj = {};

		// public vars
		sServObj.audioBuffer = {};
		sServObj.isPlaying = false;

		///////////////////////////////////////////
		// private API

		/**
		 * safely initialize audio context
		 * */
		function initAudioContext() {
			try {
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				audioContext = new AudioContext();
			} catch (e) {
				alert("Error loading the AudioContext (could mean your browser doesn't support the HTML5 webaudio API):" + e);
			}
		}

		///////////////////////////////////////////
		// public API

		/**
		 * decode and play a passed in buffer
		 *
		 * @param buffer arraybuffer containing audio file (as returned by XHR for example)
		 * */
		sServObj.decodeAndPlay = function (sampleStart, endSample) {
			if (typeof(audioContext) == "undefined") {
				initAudioContext();
			}

			var startTime = sampleStart / sServObj.audioBuffer.sampleRate;
            var endTime = endSample / sServObj.audioBuffer.sampleRate;
			var durTime = endTime - startTime;


			// audioContext.decodeAudioData(buffer, function (ab) {
				curSource = audioContext.createBufferSource();
				curSource.buffer = sServObj.audioBuffer;
				curSource.connect(audioContext.destination);
				curSource.start(0, startTime, durTime);
				curSource.onended = function () {
					sServObj.isPlaying = false;
				}

			//}, function (e) {
			//	alert(e);
			//});
		};


		/**
		 * Creates new ArrayBuffer containing wav file that goes
		 * from sampleStart to endSample
		 *
		 * @param sampleStart number that represents start sample
		 * @paramn endSample number that represents end sample
		 * @returns ArrayBuffer containing wav file
		 * */
		// sServObj.extractRelPartOfWav = function (sampleStart, endSample) {
		// 	var bytePerSample = sServObj.wavJSO.BitsPerSample / 8;
		// 	var headerSize = 44;
		// 	if(sServObj.wavJSO.Subchunk1Size == 18){
		// 		headerSize = 46;
		// 	}
        //
		// 	var header = sServObj.wavJSO.origArrBuf.subarray(0, headerSize);
		// 	var data = sServObj.wavJSO.origArrBuf.subarray(headerSize, sServObj.wavJSO.Data.length * bytePerSample);
        //
		// 	var dv = new DataView(header);
		// 	var Subchunk2SizePos = 40;
		// 	if(sServObj.wavJSO.Subchunk1Size == 18){
		// 		Subchunk2SizePos = 42;
		// 	}
		// 	dv.setUint32(Subchunk2SizePos, (endSample - sampleStart) * bytePerSample, true);
		// 	// var Subchunk2Size = dv.getUint32(40, true);
		// 	// console.log(Subchunk2Size);
        //
		// 	var newData = data.subarray(sampleStart * bytePerSample, (endSample - sampleStart) * bytePerSample);
        //
		// 	var tmp = new Uint8Array(header.byteLength + newData.byteLength);
		// 	tmp.set(new Uint8Array(header), 0);
		// 	tmp.set(new Uint8Array(newData), header.byteLength);
        //
		// 	return (tmp.buffer);
		// };

		/**
		 * play audio from to specified in samples
		 *
		 * @param sampleStart number that represents start sample
		 * @param endSample number that represents end sample
		 * */
		sServObj.playFromTo = function (sampleStart, endSample) {

			//var cutWavBuff = this.extractRelPartOfWav(sampleStart, endSample);

			if (sServObj.isPlaying) {
				sServObj.isPlaying = false;
				curSource.stop(0);
			} else {

				sServObj.isPlaying = true;
				if (sServObj.audioBuffer.length > 0) { // if wav file is not empty
					sServObj.decodeAndPlay(sampleStart, endSample);
				}
			}

		};


		return sServObj;

	});