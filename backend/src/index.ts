import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";
import express from "express"
import { WebSocketServer } from "ws";
import dataSource from "./dataSource.js";
import { SocketManager } from "./controller/SocketManager.js";
import { uuidGenerator } from "./utils.js";

dotenv.config({});

console.debug(`Starting in ${process.env.NODE_ENV} mode`);

async function main() {
    await dataSource.initialize();

    const app = express();
    const httpServer = http.createServer(app);
    app.use(express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist")));

    const wsManager = new SocketManager(
        //todo: consistent generation of server uuid
        uuidGenerator(),
        {
            server: httpServer,
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