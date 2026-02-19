import {IAnnotJSON} from './annot-json.interface';
import {I_globalScss} from '../../styles/EMUwebAppDesign.scss';

export interface WindowMessageCommand<T extends any> {
    type: "command" | "response",
    command: "load" | "set_style" | "get_style" | "get_version";
    params: T;
}

export interface WindowMessageCommandLoadParams {
    labelType?: string;
    saveToWindowParent?: boolean;
    disableBundleListSidebar?: boolean;
    audioGetUrl?: string;
    labelGetUrl?: string;
    audioArrayBuffer?: ArrayBuffer;
    annotation?: IAnnotJSON;
    styles?: WindowMessageCommandStyleParams;
}

/**
 * Command loads the EMU-webApp with given data.
 */
export interface WindowMessageCommandLoad extends WindowMessageCommand<WindowMessageCommandLoadParams> {
    command: "load";
}

export interface WindowMessageCommandStyleParams extends Partial<I_globalScss> {
    spectrogram?: {
        heatMapColorAnchors?: number[][];
    }
}

/**
 * Command overwrites the styles for the EMU-webApp
 */
export interface WindowMessageCommandSetStyle extends WindowMessageCommand<WindowMessageCommandStyleParams> {
    command: "set_style";
}

/**
 * Command requests information about the styles used by the EMU-webApp. EMU webApp responses with given styles.
 */
export interface WindowMessageCommandGetStyle extends WindowMessageCommand<undefined> {
    command: "get_style";
}

/**
 * Command requests information about the current version of the EMU-webApp. EMU webApp responses with the given version.
 */
export interface WindowMessageCommandGetVersion extends WindowMessageCommand<undefined> {
    command: "get_version";
}

