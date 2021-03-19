export interface Template {
    type: "div" | "span" | "presetText";
    style?: { [styleKey: string]: string };
    text?: string;
    children?: Template[];
}
