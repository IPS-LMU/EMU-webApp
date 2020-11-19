// Dependencies get bundled into the worker:
import { WavHeaderInfos } from '../interfaces/wav-header-infos.interface';
import { WavFileInfos } from '../interfaces/wav-file-infos.interface';
import { WavRange } from '../interfaces/wav-range.interface';

// Export as you would in a normal module:
export class WavRangeReq {
  
  private wavFileInfo: WavFileInfos; // TODO define interface
  private url: URL;

  ///////////////////////////
  // public api
  constructor() {
  }

  public async setURL(url: string) {
    // get header and parse it 
    // (will the header always fit into 200 bytes?
    // Usually offsetToDataChunk is 44 but who knows)
    let resp = await fetch(url, { method: 'GET', headers: { Range: `bytes=0-199` } })
    let buffer = await resp.arrayBuffer();
    // do something with buffer
    let headerInfos = this.parseWavHeader(buffer);
    this.wavFileInfo = {
      url: url,
      headerInfos: headerInfos,
      firstSampleBlockIdx: 0,
      lastSampleBlockIdx: (headerInfos.dataChunkSize / headerInfos.BlockAlign) - 1
    }
  }

  public async getWavFileInfo() {
    return this.wavFileInfo;
  }

  public async getRange(startSampleBlockIdx: number, endSampleBlockIdx: number){
    if(startSampleBlockIdx < 0 || endSampleBlockIdx > this.wavFileInfo.lastSampleBlockIdx){
      throw "startSample or endSample out of range"; // sic this doesn't work!
    }

    let firstByte = this.sampleBlockIdxToByte(startSampleBlockIdx);
    let lastByte = this.sampleBlockIdxToByte(endSampleBlockIdx + 1) - 1; // - 1 to comp. for Range "read up to byte"

    // request range from server
    let resp = await fetch(this.wavFileInfo.url, { method: 'GET', headers: { Range: 'bytes=' + firstByte + '-' + lastByte } })
    
    // console.log(resp);
    let samplesBin = await resp.arrayBuffer();
    // console.log(new Int16Array(samplesBin)); // this works
    
    // copy original header
    let headerBin = new Uint8Array(this.wavFileInfo.headerInfos.origBinaryHeader);
    // reset dataChunkSize
    let curBufferView = new Uint32Array(
      headerBin.buffer,
      this.wavFileInfo.headerInfos.dataChunkSizeIdx,
      1);
    // console.log(curBufferView);
    curBufferView[0] = (endSampleBlockIdx - startSampleBlockIdx + 1) * this.wavFileInfo.headerInfos.NumChannels * (this.wavFileInfo.headerInfos.BitsPerSample / 8);
    // console.log(curBufferView[0]);
    // concatenate header with samples
    let wavFileBin = new Uint8Array(headerBin.length + curBufferView[0]);
    wavFileBin.set(headerBin, 0);
    wavFileBin.set(new Uint8Array(samplesBin), headerBin.length);
    
    let range: WavRange = {
      numberOfChannels: this.wavFileInfo.headerInfos.NumChannels,
      length: curBufferView[0] / this.wavFileInfo.headerInfos.NumChannels / (this.wavFileInfo.headerInfos.BitsPerSample / 8), 
      sampleRate: this.wavFileInfo.headerInfos.SampleRate,
      buffer: wavFileBin.buffer,
      startSampleBlockIdx: startSampleBlockIdx,
      endSampleBlockIdx: endSampleBlockIdx
    };

    return(range);

  }

  public calculatePeaks(audioBuffer: any) {
    console.log(audioBuffer);
  }

  //////////////////////////
  // private api
  private sampleBlockIdxToByte(sampleBlockIdx: number){
    return(this.wavFileInfo.headerInfos.offsetToDataChunk + sampleBlockIdx * this.wavFileInfo.headerInfos.BlockAlign);
  }

  private parseWavHeader(buf: ArrayBuffer): WavHeaderInfos {
  
    // TODO: check on error handling
    let headerInfos: WavHeaderInfos;
    let curBinIdx, curBuffer, curBufferView;
  
    // ChunkId == RIFF CHECK
    curBinIdx = 0;
    curBufferView = new Uint8Array(buf, curBinIdx, 4);
    const ChunkID: string = String.fromCharCode.apply(null, curBufferView);
  
    if (ChunkID !== 'RIFF') {
      throw new Error('Wav read error: ChunkID not RIFF but ' + ChunkID);
    }
  
    // ChunkSize
    curBinIdx = 4;
    curBufferView = new Uint32Array(buf, curBinIdx, 1);
    const ChunkSize: number = curBufferView[0];
  
    // Format == WAVE CHECK
    curBinIdx = 8;
    curBufferView = new Uint8Array(buf, curBinIdx, 4);
    const Format: string = String.fromCharCode.apply(null, curBufferView);
    if (Format !== 'WAVE') {
      throw new Error('Wav read error: Format not WAVE but ' + Format);
    }
  
    // look for 'fmt ' sub-chunk as described here: http://soundfile.sapp.org/doc/WaveFormat/
    let foundChunk = false;
    let fmtBinIdx = 12; // 12 if first sub-chunk
    let FmtSubchunkID: string;
    while(!foundChunk){
      // curBuffer = buf.subarray(fmtBinIdx, 4);
      curBufferView = new Uint8Array(buf, fmtBinIdx, 4);
      let cur4chars = String.fromCharCode.apply(null, curBufferView);
      if(cur4chars === 'fmt '){
        // console.log('found fmt chunk at ' + fmtBinIdx);
        FmtSubchunkID = 'fmt ';
        foundChunk = true;
  
      }else{
        fmtBinIdx += 1;
      }
      if(cur4chars === 'data'){
        throw new Error('Wav read error: Reached end of header by reaching data sub-chunk without finding "fmt " sub-chunk');
      }
  
    }
  
    // FmtSubchunkSize parsing
    curBinIdx = fmtBinIdx + 4; // 16
    curBufferView = new Uint32Array(buf, curBinIdx, 4);
    const FmtSubchunkSize: number = curBufferView[0];
  
    // AudioFormat == 1  CHECK
    curBinIdx = fmtBinIdx + 8; // 20
    //curBuffer = buf.subarray(curBinIdx, 2);
    curBufferView = new Uint16Array(buf, curBinIdx, 2);
    const AudioFormat: number = curBufferView[0];
    if ([0, 1].indexOf(AudioFormat) === -1) {
      throw new Error('Wav read error: AudioFormat not 0 or 1 but ' + AudioFormat);
    }
  
    // NumChannels == 1  CHECK
    curBinIdx = fmtBinIdx + 10; // 22
    curBufferView = new Uint16Array(buf, curBinIdx, 2);
    const NumChannels: number = curBufferView[0];
    if (NumChannels < 1) {
      throw new Error('Wav read error: NumChannels not greater than 1 but ' + NumChannels);
    }
  
    // SampleRate
    curBinIdx = fmtBinIdx + 12; // 24
    curBufferView = new Uint32Array(buf, curBinIdx, 1);
    const SampleRate: number = curBufferView[0];
  
    // ByteRate
    curBinIdx = fmtBinIdx + 16; // 28
    curBufferView = new Uint32Array(buf, curBinIdx, 1);
    const ByteRate: number = curBufferView[0];
  
    // BlockAlign
    curBinIdx = fmtBinIdx + 20; // 32
    curBufferView = new Uint16Array(buf, curBinIdx, 1);
    const BlockAlign: number = curBufferView[0];
  
    // BitsPerSample
    curBinIdx = fmtBinIdx + 22; // 34
    curBufferView = new Uint16Array(buf, curBinIdx, 1);
    const BitsPerSample: number = curBufferView[0];
  
    // look for data chunk size
    foundChunk = false;
    let dataBinIdx = fmtBinIdx + 24; // 36
    
    let dataChunkSizeIdx: number;
    let dataChunkSize: number;
    let offsetToDataChunk: number;

    while(!foundChunk){
      //curBuffer = buf.subarray(dataBinIdx, 4);
      curBufferView = new Uint8Array(buf, dataBinIdx, 4);
      let cur4chars = String.fromCharCode.apply(null, curBufferView);
      if(cur4chars === 'data'){
        foundChunk = true;
        curBufferView = new Uint32Array(buf, dataBinIdx + 4, 1);
        dataChunkSizeIdx = dataBinIdx + 4;
        dataChunkSize = curBufferView[0];
        offsetToDataChunk = dataBinIdx + 8;
      } else {
        dataBinIdx += 1;
      }
    }
    return {
      ChunkID: ChunkID,
      ChunkSize: ChunkSize,
      Format: Format,
      FmtSubchunkID: FmtSubchunkID,
      FmtSubchunkSize: FmtSubchunkSize,
      AudioFormat: AudioFormat,
      NumChannels: NumChannels,
      SampleRate: SampleRate,
      ByteRate: ByteRate,
      BlockAlign: BlockAlign,
      BitsPerSample: BitsPerSample,
      dataChunkSizeIdx: dataChunkSizeIdx,
      dataChunkSize: dataChunkSize,
      offsetToDataChunk: offsetToDataChunk,
      origBinaryHeader: new Uint8Array(buf, 0, offsetToDataChunk) // copy original
  };
  
  };

}