import WebSocket from "ws";
import type { WebsocketClientConfigMessage, WebsocketDataKeyMessage, WebsocketErrorMessage, WebsocketLoginMessage, WebsocketMessage } from "@videotextgenerator/api"
import { Client } from "../model/Client.js";
import { BackendDataKey } from "./BackendDataKey.js";
import { ClientRepository, clientRepository } from "../repository/ClientRepository.js";
import { BackendClient } from "./BackendClient.js";
import { SocketManager } from "./SocketManager.js";

export class ClientSocket {

    public client: BackendClient | undefined;

    constructor(
        protected readonly socket: WebSocket,
        protected readonly manager: SocketManager,
        public readonly uuid: string,
        protected readonly serverUuid: string,
    ) {
        socket.on("message", this.onMessage.bind(this));
        socket.on("error", this.onError.bind(this));
        socket.on("close", this.onClose.bind(this));
    }

    protected async onMessage(data: WebSocket.RawData, isBinary: boolean): Promise<void> {
        if (!this.isConnected) {
            console.error("Message recevied for non opened socket. Ignoring");
            return;
        }
        if (isBinary) {
            console.warn("Received unsupported binary message");
            return;
        }
        const json: WebsocketMessage = JSON.parse(data.toString("utf-8"));
        if (json.type == "login") {
            this.manager.clientManager.loginClient(this, json as WebsocketLoginMessage);
        } else if (this.client === undefined) {
            this.manager.clientManager.loginClient(this);
        }
        switch (json.type) {
            case "dataKey":
                await BackendDataKey.received(json as WebsocketDataKeyMessage, this.client);
                break;
        }
    }

    protected onError(error: Error) {
        console.warn(`Socket to client ${this.client?.uuid} error ${error.message}`);
    }

    protected onClose(code: number, reason: Buffer) {
        console.log(`Socket to client ${this.client?.uuid} closed with ${code}:${reason.toString("utf-8")}`);
    }

    send(msg: WebsocketMessage) {
        this.socket.send(JSON.stringify(msg));
    }

    close() {
        this.client = undefined;
        try { this.socket.close(); } catch { }
    }

    get isConnected(): boolean {
        return this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING
    }
}