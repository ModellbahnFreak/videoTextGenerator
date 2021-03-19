import { Preset } from "./Presets.js";
import { applyStyles } from "./updateViewport.js";

export function setPreset(
    preset: Preset,
    currentPresetValues: Map<string, string>,
    presetTextFields: Map<string, Set<HTMLElement>>
) {
    if (preset.styles instanceof Array) {
        preset.styles.forEach((s) => {
            const elem = document.getElementById(s.id);
            if (elem) {
                applyStyles(elem, s.style);
            }
        });
    }
    if (preset.text instanceof Array) {
        preset.text.forEach((text) => {
            const fields = presetTextFields.get(text.key);
            if (!text.value || text.value == "") {
                currentPresetValues.delete(text.key);
                if (fields) {
                    fields.forEach((f) => {
                        f.innerText = "";
                    });
                }
            } else {
                currentPresetValues.set(text.key, text.value);
                const fields = presetTextFields.get(text.key);
                if (fields) {
                    fields.forEach((f) => {
                        f.innerText = text.value;
                    });
                }
            }
        });
    }
}
