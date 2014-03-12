'use strict';

angular.module('emuwebApp')
	.service('Soundhandlerservice', function Soundhandlerservice($document, Binarydatamaniphelper) {
		// shared service object
		var sServObj = {};

		sServObj.wavJSO = {};

		sServObj.player = $document[0].createElement('audio');
		sServObj.player.isPlaying = false;

		sServObj.setPlayerSrc = function (buf) {
			var base64String = Binarydatamaniphelper.arrayBufferToBase64(buf);
			this.player.src = 'data:audio/wav;base64,' + base64String;
		};

		sServObj.resetPlayerSrcFromTo = function (sampleStart, endSample) {
			var bytePerSample = this.wavJSO.BitsPerSample / 8;
			var header = this.wavJSO.origArrBuf.subarray(0, 44);
			var data = this.wavJSO.origArrBuf.subarray(44, this.wavJSO.Data.length * bytePerSample);

			var dv = new DataView(header);
			dv.setUint32(40, (endSample - sampleStart) * bytePerSample, true);
			// var Subchunk2Size = dv.getUint32(40, true);
			// console.log(Subchunk2Size);

			var newData = data.subarray(sampleStart * bytePerSample, (endSample - sampleStart) * bytePerSample);

			var tmp = new Uint8Array(header.byteLength + newData.byteLength);
			tmp.set(new Uint8Array(header), 0);
			tmp.set(new Uint8Array(newData), header.byteLength);

			var base64String = Binarydatamaniphelper.arrayBufferToBase64(tmp.buffer);
			this.player.src = 'data:audio/wav;base64,' + base64String;
		};

		sServObj.playFromTo = function (sampleStart, endSample) {
			this.resetPlayerSrcFromTo(sampleStart, endSample);

			if (this.player.isPlaying) {
				this.player.isPlaying = false;
				this.player.pause();
			} else {
				this.player.isPlaying = true;
				this.player.play();
			}

		};

		sServObj.player.addEventListener('ended', function () {
			this.isPlaying = false;
		}, false);


		return sServObj;

	});