import { ClientSocket } from "./Socket.js";
import { Client } from "../model/Client.js"
import { ClientRepository } from "../repository/ClientRepository.js";
import { WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketEventMessage, WebsocketMessage, WebsocketSubscribeMessage } from "@videotextgenerator/api";
import { ClientManager } from "./ClientManager.js";

export class BackendClient {
    protected readonly sockets: Map<string, ClientSocket> = new Map();
    protected readonly subscribedTopics: Map<string, boolean /* Todo: replace with instance of Topic for permission check */> = new Map();

    constructor(
        protected client: Client,
        protected manager: ClientManager,
    ) {

    }

    protected async reloadClient() {
        let reloaded = await this.manager.clientRepository.findOne({
            where: { uuid: this.client.uuid },
            cache: true
        });
        if (!reloaded) {
            // todo: inform sockets that client has been deleted
            console.warn("Client was deleted: " + this.client.uuid);
            reloaded = await this.manager.clientRepository.save(this.client);
        }
        this.client = reloaded;
    }

    protected async sendAlDataKeysFor(topic: string): Promise<void> {
        const dataKeyMsgs = (await this.manager.dataKeyManager.allKnownFor(topic)).map(instance => ({
            type: "dataKey",
            topic, dataKey: instance.key,
            version: instance.currentVersion, subversion: instance.currentSubversion,
            value: instance.value,
        } as WebsocketDataKeyMessage));
        for (const [uuid, socket] of this.sockets) {
            for (const msg of dataKeyMsgs) {
                socket.send(msg);
            }
        }
    }

    protected async subscribeTo(topic: string): Promise<void> {
        if (this.subscribedTopics.has(topic)) {
            return;
        }
        this.subscribedTopics.set(topic, true);
        await this.sendAlDataKeysFor(topic);
    }

    addSocket(socket: ClientSocket) {
        this.sockets.set(socket.uuid, socket);
        for (const topic of this.subscribedTopics.keys()) {
            this.sendAlDataKeysFor(topic);
        }
    }

    removeSocket(socket: ClientSocket) {
        this.sockets.delete(socket.uuid);
    }

    async dataKey(topic: string, dataKey: string, value: unknown, version: number, subversion: number) {
        if (!this.subscribedTopics.has(topic)) {
            return;
        }
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            topic, dataKey, value, version, subversion
        };
        for (const [uuid, socket] of this.sockets) {
            socket.send(dataKeyMsg);
        }
    }

    async event(topic: string, event: string, payload: unknown, evtUuid: string) {
        if (!this.subscribedTopics.has(topic)) {
            return;
        }
        const eventMsg: WebsocketEventMessage = {
            type: "event",
            topic, event, payload, evtUuid
        };
        for (const [uuid, socket] of this.sockets) {
            socket.send(eventMsg);
        }
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
        }
    }

    get clientModel(): Client {
        return this.client;
    }

    get uuid(): string {
        return this.client.uuid;
    }
}