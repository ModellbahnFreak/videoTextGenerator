import WebSocket from "ws";
import type { WebsocketErrorMessage, WebsocketLoginMessage, WebsocketMessage } from "@videotextgenerator/api"
import { Topic } from "./Topic.js";
import { Client } from "./Client.js";
import type { ClientRepository } from "../repository/ClientRepository.js";

export class ClientSocket {

    protected client: Client | undefined;

    protected readonly topicSubscriptions: Topic[] = [];

    constructor(
        protected readonly socket: WebSocket,
        protected readonly clientRepository: ClientRepository
    ) {
        socket.on("message", this.onMessage.bind(this));
        socket.on("error", this.onError.bind(this));
        socket.on("close", this.onClose.bind(this));
    }

    protected onMessage(data: WebSocket.RawData, isBinary: boolean) {
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
            case ""

        }
    }

    protected onError(error: Error) {
        console.warn(`Socket to client ${this.client?.uuid} error ${error.message}`);
        if (this.socket.readyState !== WebSocket.OPEN && this.socket.readyState !== WebSocket.CONNECTING) {
            this.client?.removeSocket(this);
        }
    }

    protected onClose(code: number, reason: Buffer) {
        console.log(`Socket to client ${this.client?.uuid} closed with ${code}:${reason.toString("utf-8")}`);
        this.client?.removeSocket(this);
    }

    protected async loginClient(msg?: WebsocketLoginMessage) {
        let newClient = await this.clientRepository.loginClient(msg?.token);
        if (!newClient) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Login error. Will use last login or create new one",
                relatesTo: msg
            }
            this.send(err);
            return;
        }
        if (this.client) {
            this.client.removeSocket(this);
        }
        if (newClient) {
            this.client = newClient;
            this.client.addSocket(this);
        } else {
            if (this.client) {
                this.client.addSocket(this);
            } else {
                newClient = await this.clientRepository.loginClient();
                if (newClient) {
                    this.client = newClient;
                    this.client.addSocket(this);
                } else {
                    const err: WebsocketErrorMessage = {
                        type: "error",
                        message: "Could not create new login. Closing",
                        relatesTo: msg
                    }
                    this.send(err);
                    this.socket.close(500, "Could not login client");
                }
            }
        }
    }

    protected send(msg: WebsocketMessage) {
        this.socket.send(JSON.stringify(msg));
    }

    get isConnected(): boolean {
        return this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING
    }
}