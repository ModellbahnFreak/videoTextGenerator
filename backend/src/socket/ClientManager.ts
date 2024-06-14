import type { WebsocketMessage, WebsocketLoginMessage, DataKeyListener, ListenerOptions, EventListener, WebsocketErrorMessage, WebsocketClientConfigMessage, WebsocketDataKeyMessage } from "@videotextgenerator/api"
import { BackendClient } from "./BackendClient.js";
import { ClientRepository } from "../repository/ClientRepository.js";
import { ClientSocket } from "./Socket.js";
import { DataKeyManager } from "../data/DataKeyManager.js";
import { EventManager } from "../data/EventManager.js";

export class ClientManager {
    protected readonly clients: Map<string, BackendClient> = new Map();

    constructor(
        public readonly clientRepository: ClientRepository,
        public readonly dataKeyManager: DataKeyManager,
        public readonly eventManager: EventManager,
        protected readonly serverUuid: string,
    ) { }

    async loginClient(socket: ClientSocket, msg?: WebsocketLoginMessage): Promise<void> {
        let clientModel = await this.clientRepository.loginClient(msg?.token);
        if (!clientModel) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Login error. Will use last login or create new one",
                relatesTo: msg
            }
            socket.send(err);
            return;
        }
        let client = this.clients.get(clientModel.uuid);
        if (!client) {
            client = new BackendClient(clientModel, this);
            this.clients.set(clientModel.uuid, client);
        }

        if (socket.client) {
            client.removeSocket(socket);
        }
        socket.client = client;
        client.addSocket(socket);

        const clientConfig: WebsocketClientConfigMessage = {
            type: "clientConfig",
            uuid: client.uuid,
            serverUuid: this.serverUuid,
            config: client.clientModel.config,
        };
        socket.send(clientConfig);
    }

    async dataKey(topic: string, dataKey: string, value: unknown, version: number = -1, subversion: number = 0): Promise<void> {
        await Promise.all([...this.clients.values()].map(c => c.dataKey(topic, dataKey, value, version, subversion)));
    }

    async event(topic: string, event: string, payload: unknown, evtUuid: string = "") {
        await Promise.all([...this.clients.values()].map(c => c.event(topic, event, payload, evtUuid)));
    }

}