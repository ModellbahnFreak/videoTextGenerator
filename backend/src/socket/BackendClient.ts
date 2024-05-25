import { ClientSocket } from "./Socket.js";
import { Client } from "../model/Client.js"
import { ClientRepository } from "../repository/ClientRepository.js";
import { WebsocketDataKeyMessage, WebsocketEventMessage, WebsocketMessage } from "@videotextgenerator/api";
import { ClientManager } from "./ClientManager.js";

export class BackendClient {
    protected readonly sockets: Map<string, ClientSocket> = new Map();

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

    addSocket(socket: ClientSocket) {
        this.sockets.set(socket.uuid, socket);
    }

    removeSocket(socket: ClientSocket) {
        this.sockets.delete(socket.uuid);
    }

    async dataKey(topic: string, dataKey: string, value: unknown, version: number) {
        await this.reloadClient();
        if (!(await this.client.topicSubscriptions).map(topic => topic.idOrName).includes(topic)) {
            return;
        }
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            topic, dataKey, value, version
        };
        for (const [uuid, socket] of this.sockets) {
            socket.send(dataKeyMsg);
        }
    }

    async event(topic: string, event: string, payload: unknown, evtUuid: string) {
        await this.reloadClient();
        if (!(await this.client.topicSubscriptions).map(topic => topic.idOrName).includes(topic)) {
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
            case "dataKey":
                const dataKeyMsg = msg as WebsocketDataKeyMessage;
                await this.manager.dataKeyManager.received(dataKeyMsg.topic, dataKeyMsg.dataKey, dataKeyMsg.value, dataKeyMsg.version, this.client);
                break;
        }
    }

    get uuid(): string {
        return this.client.uuid;
    }
}