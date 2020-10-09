export interface WavRange {
    numberOfChannels: number;
    length: number;
    sampleRate: number;
    buffer: ArrayBuffer;
    startSampleBlockIdx: number;
    endSampleBlockIdx: number
}