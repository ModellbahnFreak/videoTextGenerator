
import express from "express";
import * as http from "http";
import io from "socket.io";
import { configLoader } from "./configLoading/configLoader";
import cors from "cors";
import * as path from "path";
import { Config } from "./configLoading/Config";
import { configMerger } from "./configLoading/configMerger";
import { loadAllPlugins, Plugin } from "./plugins/plugin";

async function main() {

    let config = configMerger(configLoader<Config>());
    const plugins = await loadAllPlugins(config?.plugins?.blacklist);

    const app = express();
    const server = http.createServer(app);
    const socketServer = new io.Server(server, {
        cors: {
            origin: "*",
        },
    });
    const viewers: Set<io.Socket> = new Set();
    const editors: Set<io.Socket> = new Set();

    app.use(cors());

    app.get("/", (req, res) => {
        res.sendFile(
            path.normalize(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "vueFrontend",
                    "dist",
                    "index.html"
                )
            )
        );
    });
    app.use(
        "/",
        express.static(
            path.normalize(path.join(__dirname, "..", "..", "vueFrontend", "dist"))
        )
    );
    app.use("*", (req, res) => {
        res.sendFile(
            path.normalize(
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "vueFrontend",
                    "dist",
                    "index.html"
                )
            )
        );
    });

    function editorMsgReceived(data: any) {
        if (typeof data == "object" && typeof data.type === "string") {
            if (
                data.type == "set" &&
                data.cue instanceof Array &&
                typeof data.stringKey === "string"
            ) {
                for (const plugin of plugins) {
                    const res = plugin.onCueSet(data.stringKey, data.cue);
                    if (res === false) {
                        return;
                    } else if (res instanceof Array) {
                        data.cue = res;
                    }
                }
                viewers.forEach((v) => {
                    v.emit("viewer", {
                        type: "set",
                        stringKey: data.stringKey,
                        cue: data.cue,
                    });
                });
                editors.forEach((v) => {
                    v.emit("editor", {
                        type: "set",
                        stringKey: data.stringKey,
                        cue: data.cue,
                    });
                });
            } else if (data.type == "reloadConfig") {
                config = configMerger(configLoader<Config>());
                editors.forEach((v) => {
                    v.emit("editor", {
                        type: "config",
                        config: config,
                    });
                });
                plugins.forEach(p => p.reloadConfig());
            } else if (data.type == "clearAll") {
                for (const plugin of plugins) {
                    const res = plugin.onClearAll();
                    if (res === false) {
                        return;
                    }
                }
                viewers.forEach((v) => {
                    v.emit("viewer", {
                        type: data.type,
                    });
                });
                editors.forEach((v) => {
                    v.emit("editor", {
                        type: data.type,
                    });
                });
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
                    } else if (data.channel == "editor") {
                        editors.add(socket);
                        socket.emit("editor", {
                            type: "config",
                            config: config,
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

    server.listen(8081, () => {
        console.log("Server running");
    });

    for (const plugin of plugins) {
        plugin.startPlugin();
        plugin.onSendMessage = editorMsgReceived;
    }

}

main();