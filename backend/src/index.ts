import express from "express";
import * as http from "http";
import io from "socket.io";
import { configLoader } from "./config/configLoader";
import { TemplatesConfig } from "./config/Templates";
import cors from "cors";
import { PresetsConfig } from "./config/Presets";
import * as path from "path";
import { PlaylistsConfig } from "./config/Playlists";

const app = express();
const server = http.createServer(app);
const socketServer = new io.Server(server);
const viewers: Set<io.Socket> = new Set();
const editors: Set<io.Socket> = new Set();
const templatesConfig = configLoader<TemplatesConfig>("templates");
const presetsConfig = configLoader<PresetsConfig>("presets");
const playlistsConfig = configLoader<PlaylistsConfig>("playlists");
let activePreset: string | undefined;

app.use(cors());

app.get("/", (req, res) => {
    res.status(200).end(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Text-Generator Viewer</title>
    </head>
    <body style="margin: 0; font-size:10vh">
    <script src="/socket.io/socket.io.js"></script>
    <script src="index.js" type="module"></script>
    </body>
    </html>`);
});
app.use("/", express.static("frontend/out/viewer"));
app.get("/edit", (req, res) => {
    if (req.path.endsWith("/")) {
        res.sendFile(
            path.join(process.cwd(), "frontend", "src", "editor", "index.html")
        );
    } else {
        res.redirect("/edit/");
    }
});
app.use("/edit", express.static("frontend/out/editor"));
app.use(
    "/material-components-web",
    express.static("node_modules/material-components-web")
);

//DEBUG:
app.use("/src", express.static("frontend/src"));

function editorMsgReceived(data: any) {
    if (typeof data == "object") {
        if (data.type === "setNamedPreset" && typeof data.id === "string") {
            const preset = presetsConfig.presets.find((p) => p.id == data.id);
            if (preset) {
                activePreset = preset.id;
                viewers.forEach((v) => {
                    v.emit("viewer", {
                        type: "setPreset",
                        preset,
                    });
                });
                editors.forEach((v) => {
                    v.emit("editor", {
                        type: "setNamedPreset",
                        id: preset.id,
                    });
                });
            }
        }
    }
}

socketServer.on("connection", (socket) => {
    console.log("Connection");
    socket.on("message", (data) => {
        console.log(data);
        if (typeof data == "object") {
            if (data.type === "subscribe") {
                if (data.channel == "viewer") {
                    viewers.add(socket);
                    socket.emit("viewer", {
                        type: "templatesConfig",
                        config: templatesConfig,
                    });
                    if (activePreset) {
                        const preset = presetsConfig.presets.find(
                            (p) => p.id == activePreset
                        );
                        if (preset) {
                            socket.emit("viewer", {
                                type: "setPreset",
                                preset,
                            });
                        }
                    }
                } else if (data.channel == "editor") {
                    editors.add(socket);
                    socket.emit("editor", {
                        type: "templatesConfig",
                        config: templatesConfig,
                    });
                    socket.emit("editor", {
                        type: "presetsConfig",
                        config: presetsConfig,
                    });
                    socket.emit("editor", {
                        type: "playlistsConfig",
                        config: playlistsConfig,
                    });
                    socket.emit("editor", {
                        type: "setNamedPreset",
                        id: activePreset,
                    });
                    socket.on("editor", editorMsgReceived);
                }
            } else if (data.type == "unsubscribe") {
                if (data.channel == "viewer") {
                    viewers.delete(socket);
                } else if (data.channel == "editor") {
                    editors.delete(socket);
                    socket.on("editor", editorMsgReceived);
                }
            }
        }
    });
    socket.on("disconnect", (reason) => {
        viewers.delete(socket);
        editors.delete(socket);
    });
});

server.listen(8080, () => {
    console.log("Server running");
});
