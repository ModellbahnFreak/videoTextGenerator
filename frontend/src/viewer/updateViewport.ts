import { Template } from "./Template.js";

export function updateViewport(
    templates: (Template & { id: string })[],
    viewportObjects: Map<string, HTMLElement>,
    presetTextFields: Map<string, Set<HTMLElement>>
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
    presetTextFields: Map<string, Set<HTMLElement>>
) {
    let existingElem = viewportObjects.get(template.id);
    existingElem = updateExistingViewportObject(
        template,
        existingElem,
        presetTextFields,
        template.id,
        template.id
    );
    document.body.appendChild(existingElem);
    viewportObjects.set(template.id, existingElem);
}

function updateExistingViewportObject(
    template: Template,
    elem: HTMLElement | undefined,
    presetTextFields: Map<string, Set<HTMLElement>>,
    name: string,
    id?: string
): HTMLElement {
    let newElem = elem;
    switch (template.type) {
        case "div":
            if (
                !(
                    typeof elem === "object" &&
                    elem.nodeName.toLowerCase() == "div"
                )
            ) {
                console.log("Creating new div");
                elem?.remove();
                newElem = document.createElement("div");
            }
            break;
        case "span":
            if (
                !(
                    typeof elem === "object" &&
                    elem.nodeName.toLowerCase() == "span"
                )
            ) {
                console.log("Creating new span");
                elem?.remove();
                newElem = document.createElement("span");
            }
            break;
        case "presetText":
            if (
                !(
                    typeof elem === "object" &&
                    elem.nodeName.toLowerCase() == "div"
                )
            ) {
                console.log("Creating new presetText");
                elem?.remove();
                newElem = document.createElement("div");
            }
            break;
        default:
            throw new Error("Illegal node type");
    }
    if (!newElem) {
        throw new Error("Error on creating updating");
    }
    newElem.className = name;
    if (id) {
        newElem.id = id;
    }

    applyStyles(newElem, template.style);

    const oldPresetTextKey = elem?.getAttribute("presetTextKey");
    if (elem && typeof oldPresetTextKey === "string") {
        const oldPresetFields = presetTextFields.get(oldPresetTextKey);
        if (oldPresetFields) {
            oldPresetFields.delete(elem);
        }
        elem.removeAttribute("presetTextKey");
    }
    if (template.type == "presetText") {
        if (typeof template.text !== "string") {
            throw new Error(
                "For type presetText 'text' field must specify preset text id"
            );
        }
        let presetFields = presetTextFields.get(template.text);
        if (!presetFields) {
            presetFields = new Set();
            presetTextFields.set(template.text, presetFields);
        }
        presetFields.add(newElem);
        newElem.setAttribute("presetTextKey", template.text);
    } else if (typeof template.text === "string") {
        newElem.innerText = template.text;
    } else if (typeof template.children === "object") {
        template.children.forEach((t, index) => {
            const oldElemChild = document.getElementsByClassName(
                `child${index}`
            )[0];
            newElem?.appendChild(
                updateExistingViewportObject(
                    t,
                    oldElemChild as HTMLElement,
                    presetTextFields,
                    `child${index}`
                )
            );
        });
    }

    return newElem;
}

export function applyStyles(
    elem: HTMLElement,
    styles?: { [styleKey: string]: string }
) {
    if (styles) {
        for (const styleKey in styles) {
            if (Object.prototype.hasOwnProperty.call(styles, styleKey)) {
                const styleValue = styles[styleKey];
                (elem.style as any)[styleKey] = styleValue;
            }
        }
    }
}
