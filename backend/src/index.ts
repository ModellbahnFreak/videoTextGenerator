import express from "express";
import * as http from "http";
import io from "socket.io";
import { configLoader } from "./config/configLoader";
import { TemplatesConfig } from "./config/Templates";

const app = express();
const server = http.createServer(app);
const socketServer = new io.Server(server);
const viewers: Set<io.Socket> = new Set();
const editors: Set<io.Socket> = new Set();
const templatesConfig = configLoader<TemplatesConfig>("templates");

app.get("/", (req, res) => {
    res.status(200).end(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Text-Generator Viewer</title>
    </head>
    <body>
    <script src="socket.io/socket.io.js"></script>
    <script src="index.js" type="module"></script>
    </body>
    </html>`);
});
app.use("/", express.static("frontend/out/viewer"));
app.get("/edit", (req, res) => {
    res.sendFile("frontend/src/editor/index.html");
});
app.use("/edit", express.static("frontend/out/editor"));

//DEBUG:
app.use("/src", express.static("frontend/src"));

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
                } else if (data.channel == "editor") {
                    editors.add(socket);
                }
            } else if (data.type == "unsubscribe") {
                if (data.channel == "viewer") {
                    viewers.delete(socket);
                } else if (data.channel == "editor") {
                    editors.delete(socket);
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
