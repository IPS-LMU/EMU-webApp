import * as angular from 'angular';

class WavParserService{
    private $q;
    private $window;
    
    private defer;
    
    constructor($q, $window){
        this.$q = $q;
        this.$window = $window;
    }
    
    /**
    * convert binary values to strings
    * (currently duplicate of function in wavParserWorkerClass)
    * SIC this should be in an external service shouldn't it?
    * @param ab array buffer containing string binary values
    */
    public ab2str(ab) {
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
    public parseWavHeader(buf){
        
        var headerInfos = {} as any;
        
        var curBinIdx, curBuffer, curBufferView;

        var extensibleWave = false;
        
        // ChunkId == RIFF CHECK
        curBinIdx = 0;
        curBuffer = buf.subarray(curBinIdx, 4);
        curBufferView = new Uint8Array(curBuffer);
        headerInfos.ChunkID = this.ab2str(curBufferView);
        
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
        headerInfos.Format = this.ab2str(curBufferView);
        if (headerInfos.Format !== 'WAVE') {
            // console.error('Wav read error: Format not WAVE. Got ' + headerInfos.Format);
            return ({
                'status': {
                    'type': 'ERROR',
                    'message': 'Wav read error: Format not WAVE but ' + headerInfos.Format
                }
            });
        }
        
        // look for 'fmt ' sub-chunk as described here: http://soundfile.sapp.org/doc/WaveFormat/
        var foundChunk = false;
        var fmtBinIdx = 12; // 12 if first sub-chunk
        while(!foundChunk){
            curBuffer = buf.subarray(fmtBinIdx, 4);
            curBufferView = new Uint8Array(curBuffer);
            var cur4chars = this.ab2str(curBufferView);
            if(cur4chars === 'fmt '){
                // console.log('found fmt chunk at' + fmtBinIdx);
                headerInfos.FmtSubchunkID = 'fmt ';
                foundChunk = true;
                
            }else{
                fmtBinIdx += 1;
            }
            if(cur4chars === 'data'){
                return ({
                    'status': {
                        'type': 'ERROR',
                        'message': 'Wav read error: Reached end of header by reaching data sub-chunk without finding "fmt " sub-chunk   '
                    }
                });
            }
            
        }
        
        // FmtSubchunkSize parsing
        curBinIdx = fmtBinIdx + 4; // 16
        curBuffer = buf.subarray(curBinIdx, 4);
        curBufferView = new Uint32Array(curBuffer);
        headerInfos.FmtSubchunkSize = curBufferView[0];
        
        // AudioFormat == 1  CHECK
        curBinIdx = fmtBinIdx + 8; // 20
        curBuffer = buf.subarray(curBinIdx, 2);
        curBufferView = new Uint16Array(curBuffer);
        headerInfos.AudioFormat = curBufferView[0];
        if (headerInfos.AudioFormat === 65534) { // 65534 means this is a Extensible Wave-Format and we have to look somewhere else for the actual format
            console.log("This wave file is an Extensible Wave");
            extensibleWave = true;
            curBinIdx = fmtBinIdx + 24; // 36
            curBuffer = buf.subarray(curBinIdx, 2);
            curBufferView = new Uint16Array(curBuffer);
            const sizeOfExtensibleWavHeader = curBufferView[0];
            console.log("Found sizeOfExtensibleWavHeader", sizeOfExtensibleWavHeader);
            if (sizeOfExtensibleWavHeader >= 22) {
                curBinIdx = fmtBinIdx + 32; // 44;
                curBuffer = buf.subarray(curBinIdx, 2);
                curBufferView = new Uint16Array(curBuffer);
                headerInfos.AudioFormat = curBufferView[0];
                // There is a 16-byte GUID; but like SoX, we only look at the first two bytes.
                // Looking at Chapter 4 of RFC 2361 [0], we could also check
                // that the last bytes translate to a GUID template like this:
                // {XXXXXXXX-0000-0010-8000-00AA00389B71}. But being more
                // thorough than SoX seems unnecessary here.
                // [0] https://www.rfc-editor.org/rfc/rfc2361
                console.log("The AudioFormat is (only the first two of 16 bytes are used, like in SoX)", headerInfos.AudioFormat);
            }
        }
        if ([0, 1, 3].indexOf(headerInfos.AudioFormat) === -1) { // 1 is int/PCM, 3 is IEEE754, 0 is unknown. Why do we support unknown?
            // console.error('Wav read error: AudioFormat not 1');
            return ({
                'status': {
                    'type': 'ERROR',
                    'message': 'Wav read error: AudioFormat not 0 or 1 or 3 but ' + headerInfos.AudioFormat
                }
            });
        }
        
        // NumChannels == 1  CHECK
        curBinIdx = fmtBinIdx + 10; // 22
        curBuffer = buf.subarray(curBinIdx, 2);
        curBufferView = new Uint16Array(curBuffer);
        headerInfos.NumChannels = curBufferView[0];
        if (headerInfos.NumChannels < 1) {
            return ({
                'status': {
                    'type': 'ERROR',
                    'message': 'Wav read error: NumChannels not greater than 1 but ' + headerInfos.NumChannels
                }
            });
        }
        
        // SampleRate
        curBinIdx = fmtBinIdx + 12; // 24
        curBuffer = buf.subarray(curBinIdx, 4);
        curBufferView = new Uint32Array(curBuffer);
        headerInfos.SampleRate = curBufferView[0];
        
        // ByteRate
        curBinIdx = fmtBinIdx + 16; // 28
        curBuffer = buf.subarray(curBinIdx, 4);
        curBufferView = new Uint32Array(curBuffer);
        headerInfos.ByteRate = curBufferView[0];
        
        // BlockAlign
        curBinIdx = fmtBinIdx + 20; // 32
        curBuffer = buf.subarray(curBinIdx, 2);
        curBufferView = new Uint16Array(curBuffer);
        headerInfos.BlockAlign = curBufferView[0];
        
        // BitsPerSample
        curBinIdx = fmtBinIdx + 22; // 34
        curBuffer = buf.subarray(curBinIdx, 2);
        curBufferView = new Uint16Array(curBuffer);
        headerInfos.BitsPerSample = curBufferView[0];
        
        // console.log(headerInfos);
        
        // look for data chunk size
        var foundChunk = false;
        var dataBinIdx = fmtBinIdx + 24; // 36 // if extensibleWave == true, we could skip a few more bytes. but let’s keep the code simpler, instead.
        while(!foundChunk){
            curBuffer = buf.subarray(dataBinIdx, 4);
            curBufferView = new Uint8Array(curBuffer);
            var cur4chars = this.ab2str(curBufferView);
            if(cur4chars === 'data'){
                foundChunk = true;
                curBuffer = buf.subarray(dataBinIdx + 4, 4);
                curBufferView = new Uint32Array(curBuffer);
                headerInfos.dataChunkSize = curBufferView[0];
            }else{
                dataBinIdx += 1;
            }
        }
        
        return headerInfos;
        
    };
    
    
    
    /**
    * parse buffer containing wav file using webworker
    * @param buf
    * @returns promise
    */
    public parseWavAudioBuf(buf) {
        var headerInfos = this.parseWavHeader(buf);
        if(typeof headerInfos.status !== 'undefined' && headerInfos.status.type === 'ERROR'){
            this.defer = this.$q.defer();
            this.defer.reject(headerInfos); // headerInfos now contains only error message
            return this.defer.promise;
        }else{
            try {
                var offlineCtx = new (this.$window.OfflineAudioContext || this.$window.webkitOfflineAudioContext)(
                    headerInfos.NumChannels,
                    headerInfos.dataChunkSize/headerInfos.NumChannels/(headerInfos.BitsPerSample/8),
                    headerInfos.SampleRate);
                    
                    this.defer = this.$q.defer();
                    // using non promise version as Safari doesn't support it yet
                    offlineCtx.decodeAudioData(buf,
                        (decodedData) => { this.defer.resolve(decodedData); },
                        (error) => { this.defer.reject(error) });
                        
                        
                        return this.defer.promise;
                        
                    }catch (e){
                        // construct error object
                        var errObj = {} as any;
                        errObj.exception = JSON.stringify(e, null, 4);
                        errObj.EMUwebAppComment = 'This could be because you are using Safari (or another webkit based browser) and the audio sample rate is not in the interval >= 44100 and <= 96000 which seem to currently be the only sample rates supported by the webkitOfflineAudioContext (see here https://github.com/WebKit/webkit/blob/29271ffbec500cd9c92050fcc0e613adffd0ce6a/Source/WebCore/Modules/webaudio/AudioContext.cpp#L111)';
                        
                        var err = {} as any;
                        err.status = {} as any;
                        err.status.message = JSON.stringify(errObj, null, 4);
                        
                        this.defer = this.$q.defer();
                        this.defer.reject(err); // headerInfos now contains only error message
                        return this.defer.promise;
                        
                    }
                    
                }
                
                
            };
            
            
        }
        
        angular.module('emuwebApp')
        .service('WavParserService', ['$q', '$window', WavParserService]);
