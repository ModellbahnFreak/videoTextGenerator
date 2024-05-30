import WebSocket from "ws";
import type { WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketErrorMessage, WebsocketLoginMessage, WebsocketMessage } from "@videotextgenerator/api"
import { BackendClient } from "./BackendClient.js";
import { ClientManager } from "./ClientManager.js";

export class ClientSocket {

    public client: BackendClient | undefined;

    constructor(
        protected readonly socket: WebSocket,
        protected readonly manager: ClientManager,
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
            this.manager.loginClient(this, json as WebsocketLoginMessage);
            return;
        } else if (this.client === undefined) {
            this.manager.loginClient(this);
        }
        if (!this.client) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Not logged in and could not auto-login. Ignoring request.",
                relatesTo: json
            }
            this.send(err);
            return;
        }
        switch (json.type) {
            case "dataKeyRequest":
                const dataKeyReqMsg = json as WebsocketDataKeyRequestMessage;
                const dataKey = await this.manager.dataKeyManager.for(dataKeyReqMsg.topic, dataKeyReqMsg.dataKey, this.client.clientModel);
                if (!dataKey) {
                    const err: WebsocketErrorMessage = {
                        type: "error",
                        message: `Not allowed to access dataKey ${dataKeyReqMsg.topic}/d-${dataKeyReqMsg.dataKey}`,
                        relatesTo: json
                    }
                    this.send(err);
                    return;
                }
                const dataKeyReqReply: WebsocketDataKeyMessage = {
                    type: "dataKey",
                    topic: dataKey.topic, dataKey: dataKey.key, value: dataKey.value, version: dataKey.currentVersion, subversion: dataKey.currentSubversion
                }
                this.send(dataKeyReqReply);
                break;
        }
        await this.client.onMessage(json);
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