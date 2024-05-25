import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";
import express from "express"
import { WebSocketServer } from "ws";
import dataSource from "./dataSource.js";
import { SocketManager } from "./socket/SocketManager.js";
import { uuidGenerator } from "./utils.js";
import { clientRepository } from "./repository/ClientRepository.js";
import { DataKeyManager } from "./data/DataKeyManager.js";
import { topicRepository } from "./repository/TopicRepository.js";
import { dataKeyRepository } from "./repository/DataKeyRepository.js";

dotenv.config({});

console.debug(`Starting in ${process.env.NODE_ENV} mode`);

async function generateUuidAndPort(): Promise<{ uuid: string, port: number }> {
    const crypto = await import("crypto");
    const hash = crypto.createHash("md5").update(import.meta.dirname).digest("hex").toLowerCase();

    let port = parseInt(process.env.VIDEOTEXTGENERATOR_SERVER_PORT ?? "NaN");
    if (!isFinite(port) || port <= 0 || port >= 65536) {
        port = (parseInt(hash.substring(0, 4), 16) % 64512) + 1024;
    }

    let uuid = process.env.VIDEOTEXTGENERATOR_SERVER_UUID;
    if (!uuid || !uuid.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
        uuid = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
    }
    return { uuid, port };
}

async function main() {
    const { uuid, port } = await generateUuidAndPort();
    console.log(`Hello! I am videotextgenerator server uuid ${uuid}`);

    await dataSource.initialize();
    const serverClient = await clientRepository.createServerClient(uuid);
    if (!process.env.VIDEOTEXTGENERATOR_SERVER_NO_CLEANUP) {
        await clientRepository.cleanup();
    }

    const app = express();
    const httpServer = http.createServer(app);
    app.use(express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist")));
    app.get("*", (req, res, next) => {
        req.url = "/";
        express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist"))(req, res, next);
    })

    const dataKeyManager = new DataKeyManager(topicRepository, dataKeyRepository, serverClient);

    const wsManager = new SocketManager(
        uuid,
        clientRepository,
        dataKeyManager,
        {
            server: httpServer,
        });
    dataKeyManager.on(wsManager.dataKey);

    console.log(`Starting backend server on port ${port}`)
    httpServer.listen(port);
}

main();