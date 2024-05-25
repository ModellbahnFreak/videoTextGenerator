import { ClientSocket } from "./ClientSocket.js";
import { Client } from "../model/Client.js"
import { ClientRepository } from "../repository/ClientRepository.js";
import { WebsocketDataKeyMessage, WebsocketEventMessage } from "@videotextgenerator/api";

export class BackendClient {
    protected readonly sockets: Map<string, ClientSocket> = new Map();

    constructor(
        protected client: Client,
        protected clientRepository: ClientRepository
    ) {

    }

    protected async reloadClient() {
        let reloaded = await this.clientRepository.findOne({
            where: {uuid: this.client.uuid},
            cache: true
        });
        if (!reloaded) {
            // todo: inform sockets that client has been deleted
            console.warn("Client was deleted: " + this.client.uuid);
            reloaded = await this.clientRepository.save(this.client);
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

    event(topic: string, event: string, payload: unknown, evtUuid: string) {
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
}