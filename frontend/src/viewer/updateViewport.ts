import { Template } from "./Template.js";

export function updateViewport(
    templates: (Template & { id: string })[],
    viewportObjects: Map<string, HTMLElement>,
    presetTextFields: Map<string, HTMLElement[]>
) {
    const elemToRemove = new Set(viewportObjects.keys());
    templates.forEach((t) => {
        elemToRemove.delete(t.id);
        updateViewportObject(t, viewportObjects, presetTextFields);
    });
    elemToRemove.forEach((id) => {
        const elem = viewportObjects.get(id);
        if (elem) {
            elem.remove();
        }
        viewportObjects.delete(id);
    });
}

export function updateViewportObject(
    template: Template & { id: string },
    viewportObjects: Map<string, HTMLElement>,
    presetTextFields: Map<string, HTMLElement[]>
) {
    let existingElem = viewportObjects.get(template.id);
    if (existingElem) {
        existingElem.remove();
    }
    existingElem = createViewportObject(
        template,
        presetTextFields,
        template.id
    );
    document.body.appendChild(existingElem);
    viewportObjects.set(template.id, existingElem);
}

function createViewportObject(
    template: Template,
    presetTextFields: Map<string, HTMLElement[]>,
    id?: string
): HTMLElement {
    let elem: HTMLElement;
    switch (template.type) {
        case "div":
            elem = document.createElement("div");
            break;
        case "span":
            elem = document.createElement("span");
            break;
        case "presetText":
            elem = document.createElement("div");
            break;
        default:
            throw new Error("Illegal node type");
    }
    if (id) {
        elem.id = id;
    }
    if (template.style) {
        for (const styleKey in template.style) {
            if (
                Object.prototype.hasOwnProperty.call(template.style, styleKey)
            ) {
                const styleValue = template.style[styleKey];
                (elem.style as any)[styleKey] = styleValue;
            }
        }
    }
    if (template.type == "presetText") {
        if (typeof template.text !== "string") {
            throw new Error(
                "For type presetText text field must specify preset text id"
            );
        }
        let presetFields = presetTextFields.get(template.text);
        if (!presetFields) {
            presetFields = [];
            presetTextFields.set(template.text, presetFields);
        }
        presetFields.push(elem);
    } else if (typeof template.text === "string") {
        elem.innerText = template.text;
    } else if (typeof template.children === "object") {
        template.children.forEach((t) => {
            elem.appendChild(createViewportObject(t, presetTextFields));
        });
    }
    return elem;
}
