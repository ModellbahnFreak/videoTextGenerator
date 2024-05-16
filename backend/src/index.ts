import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";
import express from "express"
import { WebSocketServer } from "ws";

dotenv.config({});

async function main() {
    const app = express();
    const httpServer = http.createServer(app);
    app.use(express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist")));

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/api"
    });

    wsServer.on("connection", (socket) => {
        console.log("WS connection")
    });

    let port = parseInt(process.env.VIDEOTEXTGENERATOR_SERVER_PORT ?? "NaN");
    console.log(port);
    if (!isFinite(port) || port <= 0 || port >= 65536) {
        const crypto = await import("crypto");
        port = (parseInt(crypto.createHash("md5").update(import.meta.dirname).digest("hex").substring(0, 4), 16) % 64512) + 1024;
    }
    console.log(`Starting backend server on port ${port}`)
    httpServer.listen(port);
}

main();