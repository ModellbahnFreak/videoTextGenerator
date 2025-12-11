import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";
import express from "express";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import dataSource from "./dataSource.js";
import { SocketManager } from "./socket/SocketManager.js";
import { uuidGenerator } from "./utils.js";
import { clientRepository } from "./repository/ClientRepository.js";
import { DataKeyManager } from "./data/DataKeyManager.js";
import { topicRepository } from "./repository/TopicRepository.js";
import { dataKeyRepository } from "./repository/DataKeyRepository.js";
import { EventManager } from "./data/EventManager.js";
import { topicPermissionRepository } from "./repository/TopicPermissionRepository.js";
import { PluginManager } from "./pluginManagement/PluginManager.js";

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

    const dataKeyManager = new DataKeyManager(topicRepository, dataKeyRepository, topicPermissionRepository, serverClient);
    const eventManager = new EventManager();

    const wsManager = new SocketManager(
        uuid,
        clientRepository,
        topicPermissionRepository,
        dataKeyManager,
        eventManager,
        {
            server: httpServer,
        });
    dataKeyManager.on(wsManager.dataKey);
    eventManager.on(wsManager.event);

    const pluginMgr = new PluginManager(dataKeyManager, eventManager);
    await pluginMgr.loadPlugins();
    pluginMgr.runAllPlugins();

    app.get("/http/:topic/:type/:dataKey", async (req, res) => {
        switch (req.params.type.toLowerCase()) {
            case "dataKey":
            case "d":
            case "k":
                res.status(200).end(JSON.stringify((await dataKeyManager.for(req.params.topic, req.params.dataKey))?.value));
                return;
            case "event":
            case "e":
                res.status(200).end(`{}`);
                return;
        }
    });

    app.post("/http/:topic/:type/:dataKey/:mode?", bodyParser.json(), async (req, res) => {
        try {
            console.log(`External request for ${req.params.topic}/${req.params.type}/${req.params.dataKey}`);
            const data = req.body;
            if (!data) {
                res.status(400).end(JSON.stringify({ code: 400, msg: `Empty body` }));
                return;
            }
            const mode = req.params.mode ?? 'set'
            if (mode != 'set' && mode != 'merge') {
                res.status(400).end(JSON.stringify({ code: 400, msg: `Unknown mode` }));
                return;
            }
            console.log("Data", data);
            switch (req.params.type.toLowerCase()) {
                case "dataKey":
                case "d":
                case "k":
                    const dataKey = (await dataKeyManager.for(req.params.topic, req.params.dataKey));
                    switch (mode) {
                        case 'merge':
                            if (dataKey) {
                                if (typeof dataKey.value == 'object') {
                                    dataKey.set({ ...dataKey.value, ...data });
                                } else if (typeof dataKey.value == 'string' || typeof dataKey.value == 'number') {
                                    dataKey.set(dataKey.value + data);
                                } else if (typeof dataKey.value == 'boolean') {
                                    if (data) {
                                        dataKey.set(!dataKey.value);
                                    }
                                } else {
                                    res.status(400).end(JSON.stringify({ code: 400, msg: `Merge not supported on ${req.params.topic}/d-${req.params.dataKey}` }));
                                    return;
                                }
                                res.status(200).end(JSON.stringify({ code: 200, msg: `Merged ${req.params.topic}/d-${req.params.dataKey}`, value: dataKey?.value }));
                                return;
                            }
                        case 'set':
                        default:
                            dataKey?.set(data);
                            res.status(200).end(JSON.stringify({ code: 200, msg: `Set ${req.params.topic}/d-${req.params.dataKey}`, value: dataKey?.value }));
                            return;
                    }
                case "event":
                case "e":
                    eventManager.raise(req.params.topic, req.params.dataKey, data);
                    res.status(200).end(JSON.stringify({ code: 200, msg: `Emitted ${req.params.topic}/e-${req.params.dataKey}` }));
                    return;
            }
            res.status(400).end(JSON.stringify({ code: 200, msg: `Unknown type` }));
        } catch (err) {
            console.error(`Could not set using http api`, err);
            res.status(400).end(JSON.stringify({ code: 200, msg: err }));
        }
    });

    app.use(express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist")));
    app.get("*", (req, res, next) => {
        req.url = "/";
        express.static(path.join(import.meta.dirname, "..", "..", "frontend", "dist"))(req, res, next);
    })

    console.log(`Starting backend server on port ${port}`)
    httpServer.listen(port);
}

main();