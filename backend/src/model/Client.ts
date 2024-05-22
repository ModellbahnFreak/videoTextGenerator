import WebSocket from "ws";
import { uuidGenerator } from "../utils.js";
import type { WebsocketMessage } from "@videotextgenerator/api"
import { Topic } from "./Topic.js";
import { ClientSocket } from "./ClientSocket.js";
import { Entity, PrimaryGeneratedColumn } from "typeorm";

type WebSocketMetadata = {};

@Entity()
export class Client {

    @PrimaryGeneratedColumn("uuid")
    public readonly uuid: string = "";

    protected readonly sockets: Map<ClientSocket, WebSocketMetadata> = new Map();

    protected readonly topicSubscriptions: Promise<Topic[]> = Promise.resolve([]);

    constructor() {
    }

    removeSocket(socket: ClientSocket, metadata?: WebSocketMetadata) {
        if (!metadata) {
            metadata = this.sockets.get(socket);
            if (!metadata) {
                return;
            }
        }
        this.sockets.delete(socket);
    }

    protected checkOpenSockets() {
        for (const [socket, metadata] of this.sockets) {
            if (!socket.isConnected) {
                this.removeSocket(socket, metadata);
            }
        }
    }

    addSocket(socket: ClientSocket) {
        if (!socket.isConnected) {
            return;
        }
        this.checkOpenSockets();
        this.sockets.set(socket, {});
    }
}