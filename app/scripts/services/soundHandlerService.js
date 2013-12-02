'use strict';

angular.module('emulvcApp')
	.service('Soundhandlerservice', function Soundhandlerservice($document) {
		// shared service object
		var sServObj = {};

		sServObj.wavJSO = {};;

		sServObj.player = $document[0].createElement('audio');
		sServObj.player.isPlaying = false;

		sServObj.setPlayerSrc = function(buf) {
			var base64String = this.arrayBufferToBase64(buf);
			this.player.src = 'data:audio/wav;base64,' + base64String;
		};

		sServObj.resetPlayerSrcFromTo = function(startSample, endSample) {
			var bytePerSample = this.wavJSO.BitsPerSample / 8;
			var header = this.wavJSO.origArrBuf.subarray(0, 44);
			var data = this.wavJSO.origArrBuf.subarray(44, this.wavJSO.Data.length * bytePerSample)

			var dv = new DataView(header);
			dv.setUint32(40, (endSample - startSample) * bytePerSample, true);
			var Subchunk2Size = dv.getUint32(40, true);
			// console.log(Subchunk2Size);

			var newData = data.subarray(startSample * bytePerSample, (endSample - startSample) * bytePerSample);

			var tmp = new Uint8Array(header.byteLength + newData.byteLength);
			tmp.set(new Uint8Array(header), 0);
			tmp.set(new Uint8Array(newData), header.byteLength);

			var base64String = this.arrayBufferToBase64(tmp.buffer);
			this.player.src = 'data:audio/wav;base64,' + base64String;
		};

		sServObj.playFromTo = function(startSample, endSample) {
			this.resetPlayerSrcFromTo(startSample, endSample);

			if (this.player.isPlaying) {
				this.player.isPlaying = false;
				this.player.pause();
			} else {
				this.player.isPlaying = true;
				this.player.play();
			}

		};

		sServObj.player.addEventListener('ended', function() {
			this.isPlaying = false;
		}, false);

		/**
		 * decode audio file data
		 *
		 * @param {AudioBuffer} audioData Audio data.
		 * @param cb call back function to call when done decoding
		 */

		sServObj.arrayBufferToBase64 = function(buffer) {
			var binary = '';
			var bytes = new Uint8Array(buffer);
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i])
			}
			return window.btoa(binary);
		};

		sServObj.base64ToArrayBuffer = function(string_base64) {
			console.log('ficken ficken ficken')
			var binary_string = window.atob(string_base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				var ascii = binary_string.charCodeAt(i);
				bytes[i] = ascii;
			}
			return bytes.buffer;
		}


		return sServObj;


		// sServObj.currentBuffer = {};

		// generate audio context according to browser type
		// if (navigator.userAgent.indexOf('Firefox') !== -1) {
		// 	sServObj.ac = new window.AudioContext();
		// } else {
		// 	sServObj.ac = new window.webkitAudioContext();

		// }

		// // check if sample rate is 44100...
		// if (sServObj.ac.sampleRate !== 44100) {
		// 	alert('sample rate not 44100!! Currently only 44100 supported! Sorry');
		// }
		// sServObj.destination = sServObj.ac.destination;

		// /**
		//  * decode audio file data
		//  *
		//  * @param {AudioBuffer} audioData Audio data.
		//  * @param cb call back function to call when done decoding
		//  */
		// sServObj.decodeAudioFile = function(audioData, cb) {
		// 	var my = this;

		// 	this.pause();
		// 	// console.log(audioData)

		// 	this.ac.decodeAudioData(
		// 		audioData,
		// 		function(buffer) {
		// 			my.currentBuffer = buffer;
		// 			my.lastStart = 0; // all set to 0?????
		// 			my.lastPause = 0;
		// 			my.startTime = null;
		// 			//console.log(buffer);
		// 			cb(buffer);
		// 		},
		// 		Error
		// 	);


		// };

		// /**
		//  * Plays the loaded audio region.
		//  *
		//  * @param {Number} start Start offset in seconds,
		//  * relative to the beginning of the track.
		//  *
		//  * @param {Number} end End offset in seconds,
		//  * relative to the beginning of the track.
		//  */
		// sServObj.play = function(start, end, delay) {

		// 	if (!this.currentBuffer) {
		// 		return;
		// 	}


		// 	// this.pause();

		// 	this.setSource(this.ac.createBufferSource());
		// 	this.source.buffer = this.currentBuffer;

		// 	//console.log(this.source);
		// 	//console.log(this.currentBuffer);
		// 	//if (null == start) { start = this.getCurrentTime(); }
		// 	//if (null == end  ) { end = this.source.buffer.duration; }
		// 	//if (null == delay) { delay = 0; }

		// 	this.lastStart = start;
		// 	this.startTime = this.ac.currentTime;

		// 	this.source.start(delay, start, end - start); //when, offset, duration in seconds
		// 	// this.source.noteOn(delay, start, end - start); //when, offset, duration in seconds

		// 	this.paused = false;
		// };

		// /**
		//  *
		//  */
		// sServObj.setSource = function(source) {
		// 	// this.source && this.source.disconnect();
		// 	this.source = source;
		// 	// this.source.connect(this.analyser);
		// 	// this.source.connect(this.proc);

		// 	this.source.connect(this.destination);
		// 	// this.source.connect(this.verb);
		// };


		// /**
		//  * Pauses the loaded audio.
		//  */
		// sServObj.pause = function(delay) {
		// 	if (!this.currentBuffer || this.paused) {
		// 		return;
		// 	}

		// 	// this.lastPause = this.getCurrentTime();

		// 	this.source.stop(delay || 0);

		// 	// this.source.noteOff(delay || 0); // deprecated version for safari... yay

		// 	this.paused = true;
		// };

	});