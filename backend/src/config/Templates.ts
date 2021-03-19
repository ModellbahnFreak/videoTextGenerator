export interface TemplatesConfig {
    templates: (Template & { id: string })[];
    bodyStyle: { [styleKey: string]: string };
}

interface Template {
    type: "div" | "span" | "presetText";
    style?: { [styleKey: string]: string };
    text?: string;
    children?: Template[];
}
