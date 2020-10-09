export interface WavHeaderInfos {
    ChunkID: string;
    ChunkSize: number;
    Format: string;
    FmtSubchunkID: string;
    FmtSubchunkSize: number;
    AudioFormat: number;
    NumChannels: number;
    SampleRate: number;
    ByteRate: number;
    BlockAlign: number;
    BitsPerSample: number;
    dataChunkSizeIdx: number;
    dataChunkSize: number;
    offsetToDataChunk: number;
    origBinaryHeader: Uint8Array;
}