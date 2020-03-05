import * as angular from 'angular';

angular.module('emuwebApp')
	.service('Soundhandlerservice', function Soundhandlerservice($window) {

		// private vars
		var audioContext;
		var curSource;
	
		// public vars
		this.audioBuffer = {};
		this.isPlaying = false;

		///////////////////////////////////////////
		// private API

		/**
		 * safely initialize audio context
		 * */
		function initAudioContext() {
			try {
				window.AudioContext = $window.AudioContext || $window.webkitAudioContext;
				audioContext = new AudioContext();
			} catch (e) {
				alert('Error loading the AudioContext (could mean your browser does not support the HTML5 webaudio API):' + e);
			}
		}

		///////////////////////////////////////////
		// public API

		/**
		 * decode and play a passed in buffer
		 *
		 * @param buffer arraybuffer containing audio file (as returned by XHR for example)
		 * */
		this.decodeAndPlay = function (sampleStart, endSample) {
			if (typeof(audioContext) === 'undefined') {
				initAudioContext();
			}

			var startTime = sampleStart / this.audioBuffer.sampleRate;
            var endTime = endSample / this.audioBuffer.sampleRate;
			var durTime = endTime - startTime;


			// audioContext.decodeAudioData(buffer, function (ab) {
				curSource = audioContext.createBufferSource();
				curSource.buffer = this.audioBuffer;
				curSource.connect(audioContext.destination);
				curSource.start(0, startTime, durTime);
				curSource.onended = function () {
					this.isPlaying = false;
				};

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
		// this.extractRelPartOfWav = function (sampleStart, endSample) {
		// 	var bytePerSample = this.wavJSO.BitsPerSample / 8;
		// 	var headerSize = 44;
		// 	if(this.wavJSO.Subchunk1Size == 18){
		// 		headerSize = 46;
		// 	}
        //
		// 	var header = this.wavJSO.origArrBuf.subarray(0, headerSize);
		// 	var data = this.wavJSO.origArrBuf.subarray(headerSize, this.wavJSO.Data.length * bytePerSample);
        //
		// 	var dv = new DataView(header);
		// 	var Subchunk2SizePos = 40;
		// 	if(this.wavJSO.Subchunk1Size == 18){
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
		this.playFromTo = function (sampleStart, endSample) {

			//var cutWavBuff = this.extractRelPartOfWav(sampleStart, endSample);

			if (this.isPlaying) {
				this.isPlaying = false;
				curSource.stop(0);
			} else {

				this.isPlaying = true;
				if (this.audioBuffer.length > 0) { // if wav file is not empty
					this.decodeAndPlay(sampleStart, endSample);
				}
			}

		};

	});