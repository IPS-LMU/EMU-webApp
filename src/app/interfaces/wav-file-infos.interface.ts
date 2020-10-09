import { WavHeaderInfos } from './wav-header-infos.interface';

export interface WavFileInfos {
    url: string;
    headerInfos: WavHeaderInfos;
    firstSampleBlockIdx: number;
    lastSampleBlockIdx: number;
}