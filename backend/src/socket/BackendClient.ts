import { ClientSocket } from "./Socket.js";
import { Client, ClientType } from "../model/Client.js"
import { ClientRepository } from "../repository/ClientRepository.js";
import { WebsocketClientConfigMessage, WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketEventMessage, WebsocketMessage, WebsocketSubscribeMessage } from "@videotextgenerator/api";
import { ClientManager } from "./ClientManager.js";
import { Access } from "../model/TopicPermission.js";

export class BackendClient {
    protected readonly sockets: Map<string, ClientSocket> = new Map();
    protected readonly subscribedTopics: Map<string, boolean /* Todo: replace with instance of Topic for permission check */> = new Map();

    constructor(
        protected client: Client,
        protected manager: ClientManager,
    ) {

    }

    protected async sendAllDataKeysFor(topic: string): Promise<void> {
        const dataKeyMsgs = (await this.manager.dataKeyManager.allKnownFor(topic, this.client)).map(instance => ({
            type: "dataKey",
            topic, dataKey: instance.key,
            version: instance.currentVersion, subversion: instance.currentSubversion,
            value: instance.value,
        } as WebsocketDataKeyMessage));
        for (const msg of dataKeyMsgs) {
            this.send(msg);
        }
    }

    protected async subscribeTo(topic: string): Promise<void> {
        if (this.subscribedTopics.has(topic)) {
            return;
        }
        this.subscribedTopics.set(topic, true);
        await this.sendAllDataKeysFor(topic);
    }

    addSocket(socket: ClientSocket) {
        this.sockets.set(socket.uuid, socket);
        for (const topic of this.subscribedTopics.keys()) {
            this.sendAllDataKeysFor(topic);
        }
    }

    removeSocket(socket: ClientSocket) {
        this.sockets.delete(socket.uuid);
    }

    async dataKey(topic: string, dataKey: string, value: unknown, version: number, subversion: number) {
        if (!this.subscribedTopics.has(topic)) {
            return;
        }
        // todo: check timing and cache permission lookup if needed
        if ((await this.manager.topicPermissionRepository.clientPermission(topic, this.uuid) & Access.READ) !== Access.READ) {
            return;
        }
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            topic, dataKey, value, version, subversion
        };
        this.send(dataKeyMsg);
    }

    async event(topic: string, event: string, payload: unknown, evtUuid: string) {
        if (!this.subscribedTopics.has(topic)) {
            return;
        }
        if ((await this.manager.topicPermissionRepository.clientPermission(topic, this.uuid) & Access.READ) !== Access.READ) {
            return;
        }
        const eventMsg: WebsocketEventMessage = {
            type: "event",
            topic, event, payload, evtUuid
        };
        this.send(eventMsg);
    }

    async onMessage(msg: WebsocketMessage) {
        switch (msg.type) {
            case "dataKeyRequest":
                const dataKeyReqMsg = msg as WebsocketDataKeyRequestMessage;
                this.subscribeTo(dataKeyReqMsg.topic);
                break;
            case "dataKey":
                const dataKeyMsg = msg as WebsocketDataKeyMessage;
                this.subscribeTo(dataKeyMsg.topic);
                await this.manager.dataKeyManager.received(dataKeyMsg.topic, dataKeyMsg.dataKey, dataKeyMsg.value, dataKeyMsg.version, dataKeyMsg.subversion, this.client);
                break;
            case "event":
                const eventMsg = msg as WebsocketEventMessage;
                this.subscribeTo(eventMsg.topic);
                await this.manager.eventManager.raise(eventMsg.topic, eventMsg.event, eventMsg.payload, eventMsg.evtUuid);
                break;
            case "subscribe":
                const subscribeMsg = msg as WebsocketSubscribeMessage;
                subscribeMsg.topics.forEach(topic => this.subscribeTo(topic));
                break;
            case "clientConfig":
                const clientCfgMsg = msg as WebsocketClientConfigMessage;
                if (clientCfgMsg.uuid !== this.client.uuid) {
                    if (this.client.type == ClientType.SERVER) {
                        //todo: pass client config set request to other client
                    } else {
                        throw new Error("Setting config for other client only allowed for other servers => Server to server comm");
                    }
                }
                await this.manager.clientRepository.createIfNotExists(this.client);
                this.client.config = clientCfgMsg.config;
                await this.manager.clientRepository.save(this.client);
                await this.manager.sendNewClientConfig(this);
                break;
        }
    }

    send(msg: WebsocketMessage) {
        for (const [uuid, socket] of this.sockets) {
            socket.send(msg);
        }
    }

    get clientModel(): Client {
        return this.client;
    }

    get uuid(): string {
        return this.client.uuid;
    }
}