import { Preset } from "../viewer/Presets";

const socket = io.connect();
const presetDropdown: HTMLSelectElement = document.getElementById(
    "availablePresets"
) as any;
const btnSetPreset: HTMLButtonElement = document.getElementById(
    "btnSetPreset"
) as any;

btnSetPreset?.addEventListener("click", () => {
    socket.emit("editor", {
        type: "setNamedPreset",
        id: presetDropdown.value,
    });
});

socket.on("connect", () => {
    socket.send({
        type: "subscribe",
        channel: "editor",
    });
});

socket.on("editor", (data: { type: string } & { [key: string]: any }) => {
    if (typeof data === "object") {
        if (
            data.type == "presetsConfig" &&
            typeof data.config === "object" &&
            data.config.presets instanceof Array
        ) {
            while (presetDropdown.firstElementChild) {
                presetDropdown.firstElementChild.remove();
            }
            data.config.presets.forEach((p: Preset) => {
                const elem = document.createElement("option");
                elem.value = p.id;
                elem.innerText = p.id;
                presetDropdown.appendChild(elem);
            });
        }
    }
});
