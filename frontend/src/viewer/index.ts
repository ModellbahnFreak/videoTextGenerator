import { setPreset } from "./setPreset.js";
import { Template } from "./Template.js";
import {
    applyStyles,
    updateViewport,
    updateViewportObject,
} from "./updateViewport.js";

const socket = io.connect();
const currentTemplates: Map<string, Template & { id: string }> = new Map();
const viewportObjects: Map<string, HTMLElement> = new Map();
const presetTextFields: Map<string, Set<HTMLElement>> = new Map();
const currentPresetValues: Map<string, string> = new Map();

socket.on("connect", () => {
    socket.send({
        type: "subscribe",
        channel: "viewer",
    });
});

socket.on("viewer", (data: { type: string } & { [key: string]: any }) => {
    if (typeof data === "object") {
        if (
            data.type == "templatesConfig" &&
            typeof data.config === "object" &&
            data.config.templates instanceof Array
        ) {
            currentTemplates.clear();
            data.config.templates.forEach((t: Template & { id: string }) => {
                currentTemplates.set(t.id, t);
            });
            applyStyles(document.body, data.config.bodyStyle);
            updateViewport(
                data.config.templates,
                viewportObjects,
                presetTextFields
            );
        } else if (
            data.type == "partialTemplates" &&
            data.templates instanceof Array
        ) {
            data.templates.forEach((t: Template & { id: string }) => {
                currentTemplates.set(t.id, t);
                updateViewportObject(t, viewportObjects, presetTextFields);
            });
        } else if (
            data.type == "setPreset" &&
            typeof data.preset === "object"
        ) {
            setPreset(data.preset, currentPresetValues, presetTextFields);
        }
    }
});
