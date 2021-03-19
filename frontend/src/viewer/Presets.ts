export interface Preset {
    id: string;
    styles: {
        id: string;
        style: { [styleKey: string]: string };
    }[];
    text: { key: string; value: string }[];
}
