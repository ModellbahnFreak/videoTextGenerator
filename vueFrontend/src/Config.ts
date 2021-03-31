export interface Config {
    cuelists: Cuelist[];
}

export interface Cuelist {
    name: string;
    stringKey?: string;
    cues: (Cue | Cue[])[];
}

export interface Cue {
    name: string;
    value?: string;
    isActive?: boolean;
    stringKey?: string;
}
