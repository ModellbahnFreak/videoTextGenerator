import { Playlist } from "../config/Playlist";
import { Preset } from "../config/Presets";

const socket = io.connect();
const knownPlaylists = new Map<string, string[]>();
let selectedPlaylist: string = "";
let indexSelPlaylist = -1;
const presetDropdown: HTMLSelectElement = document.getElementById(
    "availablePresets"
) as any;
const btnSetPreset: HTMLButtonElement = document.getElementById(
    "btnSetPreset"
) as any;
const availablePlaylists: HTMLSelectElement = document.getElementById(
    "availablePlaylists"
) as any;
const currPlaylist: HTMLUListElement = document.getElementById(
    "currPlaylist"
) as any;
const btnGoPlus: HTMLButtonElement = document.getElementById(
    "btnGoPlus"
) as any;
const btnGoMinus: HTMLButtonElement = document.getElementById(
    "btnGoMinus"
) as any;
const btnGoTo: HTMLButtonElement = document.getElementById("btnGoTo") as any;

btnSetPreset?.addEventListener("click", () => {
    socket.emit("editor", {
        type: "setNamedPreset",
        id: presetDropdown.value,
    });
});

function updateCurrPlaylist() {
    const playlist = knownPlaylists.get(availablePlaylists.value);
    if (playlist) {
        while (currPlaylist.firstElementChild) {
            currPlaylist.firstElementChild.remove();
        }
        indexSelPlaylist = -1;
        playlist.forEach((preset, index) => {
            /*<li class="mdc-list-item mdc-list-item--activated">
                    <span class="mdc-list-item__ripple"></span>
                    <span class="mdc-list-item__text">Single-line item</span>
                </li>*/
            const elem = document.createElement("li");
            elem.className = "mdc-list-item currPlaylistItem";
            const ripple = document.createElement("span");
            ripple.className = "mdc-list-item__ripple";
            elem.appendChild(ripple);
            const text = document.createElement("span");
            text.innerText = `${index + 1}: ${preset}`;
            elem.appendChild(text);
            elem.addEventListener("click", () => {
                indexSelPlaylist = index;
                elem.classList.add("mdc-list-item--selected");
            });
            elem.id = "currPlaylist" + index;
            currPlaylist.appendChild(elem);
        });
    }
}
availablePlaylists.addEventListener("change", () => {
    selectedPlaylist = availablePlaylists.value;
    updateCurrPlaylist();
});

function gotoSelected() {
    const playlist = knownPlaylists.get(selectedPlaylist);
    if (playlist) {
        indexSelPlaylist = indexSelPlaylist % playlist.length;
        for (const item of document.getElementsByClassName(
            "currPlaylistItem"
        )) {
            item.classList.remove("mdc-list-item--activated");
            item.classList.remove("mdc-list-item--selected");
        }
        document
            .getElementById("currPlaylist" + indexSelPlaylist)
            ?.classList.add("mdc-list-item--activated");
        socket.emit("editor", {
            type: "setNamedPreset",
            id: playlist[indexSelPlaylist],
        });
    }
}
btnGoPlus.addEventListener("click", () => {
    indexSelPlaylist++;
    gotoSelected();
});
btnGoMinus.addEventListener("click", () => {
    indexSelPlaylist--;
    gotoSelected();
});
btnGoTo.addEventListener("click", () => {
    gotoSelected();
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
        } else if (
            data.type == "playlistsConfig" &&
            typeof data.config === "object" &&
            data.config.playlists instanceof Array
        ) {
            knownPlaylists.clear();
            while (availablePlaylists.firstElementChild) {
                availablePlaylists.firstElementChild.remove();
            }
            data.config.playlists.forEach((p: Playlist) => {
                const elem = document.createElement("option");
                elem.value = p.id;
                elem.innerText = p.id;
                availablePlaylists.appendChild(elem);
                knownPlaylists.set(p.id, p.presets);
            });
            if (knownPlaylists.size >= 1) {
                if (!selectedPlaylist || knownPlaylists.has(selectedPlaylist)) {
                    selectedPlaylist = knownPlaylists.keys().next().value;
                }
                availablePlaylists.value = selectedPlaylist;
                updateCurrPlaylist();
            }
        } else if (
            data.type == "setNamedPreset" &&
            typeof data.id === "string"
        ) {
            presetDropdown.value = data.id;
        }
    }
});
