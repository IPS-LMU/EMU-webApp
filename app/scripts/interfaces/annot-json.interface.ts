export interface IAnnotJSON {
    name: string;
    annotates: string;
    sampleRate: number;
    levels: ILevel[];
    links: ILink[];
}

export interface ILevel {
    name: string;
    type: ILevelType;
    items: IItem[];
}

export interface IItem {
    id: number;
    sampleStart?: number;
    sampleDur?: number;
    samplePoint?: number;
    labels: ILabel[];
    renderHierVals?: any;
}

export interface ISegment extends IItem {
    sampleStart: number;
    sampleDur: number;
}

export interface IEvent extends IItem {
    samplePoint: number;
}

export interface ILabel {
    name: string;
    value: string;
}

export interface ILink {
    fromID: number;
    toID: number;
}

export interface IAudioFile {
    name: string;
    size: number;
    duration: number;
    samplerate: number;
}

export type ILevelType = 'ITEM' | 'SEGMENT' | 'EVENT';
