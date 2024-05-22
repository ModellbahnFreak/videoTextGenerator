import WebSocket from "ws";
import type { WebsocketDataKeyMessage, WebsocketErrorMessage, WebsocketLoginMessage, WebsocketMessage } from "@videotextgenerator/api"
import { Client } from "../model/Client.js";
import { BackendDataKey } from "./BackendDataKey.js";
import { clientRepository } from "../repository/ClientRepository.js";

export class ClientSocket {

    protected client: Client | undefined;

    constructor(
        protected readonly socket: WebSocket,
        public readonly uuid: string
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
            this.loginClient(json as WebsocketLoginMessage);
        } else if (this.client === undefined) {
            this.loginClient();
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

    protected async loginClient(msg?: WebsocketLoginMessage) {
        let newClient = await clientRepository.loginClient(msg?.token);
        if (!newClient) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Login error. Will use last login or create new one",
                relatesTo: msg
            }
            this.send(err);
            return;
        }
        this.client = newClient;
    }

    protected send(msg: WebsocketMessage) {
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