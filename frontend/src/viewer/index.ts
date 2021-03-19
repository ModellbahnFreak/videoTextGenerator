import { Template } from "./Template.js";
import { updateViewport } from "./updateViewport.js";

const socket = io.connect();
let currentTemplates: (Template & { id: string })[] = [];
const viewportObjects: Map<string, HTMLElement> = new Map();
const presetTextFields: Map<string, HTMLElement[]> = new Map();
const currentPresetValues: Map<string, string> = new Map();

socket.send({
    type: "subscribe",
    channel: "viewer",
});

socket.on("viewer", (data: { type: string } & { [key: string]: any }) => {
    if (typeof data === "object") {
        if (data.type == "templatesConfig" && typeof data.config === "object") {
            currentTemplates = data.config.templates;
            if (data.config.bodyStyle) {
                for (const styleKey in data.config.bodyStyle) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            data.config.bodyStyle,
                            styleKey
                        )
                    ) {
                        const styleValue = data.config.bodyStyle[styleKey];
                        (document.body.style as any)[styleKey] = styleValue;
                    }
                }
            }
            updateViewport(currentTemplates, viewportObjects, presetTextFields);
        }
    }
});
