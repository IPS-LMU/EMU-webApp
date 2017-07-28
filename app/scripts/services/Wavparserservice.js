'use strict';

angular.module('emuwebApp')
	.service('Wavparserservice', function Wavparserservice($q) {
		// shared service object
		var sServObj = {};

		var defer;

        /**
         * convert binary values to strings
         * (currently duplicate of function in wavParserWorkerClass)
         * SIC this should be in an external service shouldn't it?
         * @param ab array buffer containing string binary values
         */
        sServObj.ab2str = function (ab) {
            var unis = [];
            for (var i = 0; i < ab.length; i++) {
                unis.push(ab[i]);
            }
            return String.fromCharCode.apply(null, unis);
        };


        /**
         * parse header of wav file
		 * (currently duplicate of function in wavParserWorkerClass)
         * @param buf array buffer containing entire wav file
         */
        sServObj.parseWavHeader = function(buf){

            var headerInfos = {};

            var curBinIdx, curBuffer, curBufferView;

            // ChunkId == RIFF CHECK
            curBinIdx = 0;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint8Array(curBuffer);
            headerInfos.ChunkID = sServObj.ab2str(curBufferView);

            if (headerInfos.ChunkID !== 'RIFF') {
                // console.error('Wav read error: ChunkID not RIFF. Got ' + headerInfos.ChunkID);
                return ({
                    'status': {
                        'type': 'ERROR',
                        'message': 'Wav read error: ChunkID not RIFF but ' + headerInfos.ChunkID
                    }
                });
            }


            // ChunkSize
            curBinIdx = 4;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint32Array(curBuffer);
            headerInfos.ChunkSize = curBufferView[0];

            // Format == WAVE CHECK
            curBinIdx = 8;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint8Array(curBuffer);
            headerInfos.Format = sServObj.ab2str(curBufferView);
            if (headerInfos.Format !== 'WAVE') {
                // console.error('Wav read error: Format not WAVE. Got ' + headerInfos.Format);
                return ({
                    'status': {
                        'type': 'ERROR',
                        'message': 'Wav read error: Format not WAVE but ' + headerInfos.Format
                    }
                });
            }

            // Subchunk1ID == "fmt " CHECK
            curBinIdx = 12;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint8Array(curBuffer);
            headerInfos.Subchunk1ID = sServObj.ab2str(curBufferView);
            if (['fmt ', 'bext'].indexOf(headerInfos.Subchunk1ID) === -1) {
                // console.error('Wav read error: Subchunk1ID not fmt. Got ' + headerInfos.Subchunk1ID);
                return ({
                    'status': {
                        'type': 'ERROR',
                        'message': 'Wav read error: Subchunk1ID not fmt  but ' + headerInfos.Subchunk1ID
                    }
                });
            }

            // Subchunk1Size == 16 CHECK
            curBinIdx = 16;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint32Array(curBuffer);
            headerInfos.Subchunk1Size = curBufferView[0];
            // console.log([16,18].indexOf(19))
            if ([16,18,40].indexOf(headerInfos.Subchunk1Size) === -1) {
            // console.error('Wav read error: Subchunk1Size not 16');
                 return ({
                     'status': {
                         'type': 'ERROR',
                         'message': 'Wav read error: Subchunk1Size not 16, 18 or 40 but ' + headerInfos.Subchunk1Size
                     }
                 });
            }

			// check if WAVEFORMATEXTENSIBLE struct see: http://www.jensign.com/riffparse/
			if(headerInfos.Subchunk1Size !== 40){
            	// AudioFormat == 1  CHECK
            	curBinIdx = 20;
            	curBuffer = buf.subarray(curBinIdx, 2);
            	curBufferView = new Uint16Array(curBuffer);
            	headerInfos.AudioFormat = curBufferView[0];
            	if ([0, 1].indexOf(headerInfos.AudioFormat) === -1) {
                	// console.error('Wav read error: AudioFormat not 1');
                	return ({
                    	'status': {
	                        'type': 'ERROR',
    	                    'message': 'Wav read error: AudioFormat not 0 or 1 but ' + headerInfos.AudioFormat
        	            }
            	    });

            	}
			}

            // NumChannels == 1  CHECK
            curBinIdx = 22;
            curBuffer = buf.subarray(curBinIdx, 2);
            curBufferView = new Uint16Array(curBuffer);
            headerInfos.NumChannels = curBufferView[0];
            // console.error('Wav read error: NumChannels not 1');
            if (headerInfos.NumChannels < 1) {
                return ({
                    'status': {
                        'type': 'ERROR',
                        'message': 'Wav read error: NumChannels not greater than 1 but ' + headerInfos.NumChannels
                    }
                });
            }

            // SampleRate
            curBinIdx = 24;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint32Array(curBuffer);
            headerInfos.SampleRate = curBufferView[0];

            // ByteRate
            curBinIdx = 28;
            curBuffer = buf.subarray(curBinIdx, 4);
            curBufferView = new Uint32Array(curBuffer);
            headerInfos.ByteRate = curBufferView[0];

            // BlockAlign
            curBinIdx = 32;
            curBuffer = buf.subarray(curBinIdx, 2);
            curBufferView = new Uint16Array(curBuffer);
            headerInfos.BlockAlign = curBufferView[0];

            // BitsPerSample
            curBinIdx = 34;
            curBuffer = buf.subarray(curBinIdx, 2);
            curBufferView = new Uint16Array(curBuffer);
            headerInfos.BitsPerSample = curBufferView[0];


			// look for data chunk
			var foundChunk = false;
			curBinIdx = 36;
			while(!foundChunk){
	            curBuffer = buf.subarray(curBinIdx, 4);
    	        curBufferView = new Uint8Array(curBuffer);
        	    var cur4chars = sServObj.ab2str(curBufferView);
				if(cur4chars === 'data'){
					foundChunk = true;
		            curBuffer = buf.subarray(curBinIdx+4, 4);
		            curBufferView = new Uint32Array(curBuffer);
					headerInfos.dataChunkSize = curBufferView[0];
				}else{
					curBinIdx += 1;
				}
	
			}

            return headerInfos;

        };



        /**
		 * parse buffer containing wav file using webworker
		 * @param buf
		 * @returns promise
		 */
		sServObj.parseWavAudioBuf = function (buf) {
            var headerInfos = sServObj.parseWavHeader(buf);
            if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
                defer = $q.defer();
                defer.reject(headerInfos); // headerInfos now contains only error message
                return defer.promise;
            }else{
                try {
    				var offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
	    			    headerInfos.NumChannels,
		    			headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
                    	headerInfos.SampleRate);
                    return offlineCtx.decodeAudioData(buf);
                }catch (e){
                    // construct error object
                    var errObj = {};
                    errObj.exception = JSON.stringify(e, null, 4);
                    errObj.EMUwebAppComment = 'This could be because you are using Safari and the sample rate is unequal to 44100; 48000 or 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext in Safari';

                    var err = {};
                    err.status = {};
                    err.status.message = JSON.stringify(errObj, null, 4);

                    defer = $q.defer();
                    defer.reject(err); // headerInfos now contains only error message
                    return defer.promise;

                }

            }


		};

		return sServObj;

	});