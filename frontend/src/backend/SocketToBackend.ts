import type { WebsocketClientConfigMessage, WebsocketErrorMessage, WebsocketLoginMessage, WebsocketMessage, WebsocketSubscribeMessage } from "@videotextgenerator/api"
import type { useClientConfigStore } from "../vuePlugins/stores/clientConfig";

export class SocketToBackend {
    protected socket: WebSocket | undefined;
    protected remoteServerUuid: string | undefined;
    protected openingTimer: ReturnType<typeof setTimeout> | undefined;

    protected isLoggedIn: boolean = false;
    protected readonly deferredMessages: WebsocketMessage[] = [];

    constructor(
        protected readonly clientConfigStore: ReturnType<typeof useClientConfigStore> | undefined,
        protected readonly onMessage: (msg: WebsocketMessage) => void,
        protected readonly getSubscriptions: () => string[],
        public readonly serverUrl: string = "/api"
    ) {
        console.log(`Created instance for ${this.serverUrl}`);
        this.openSocket();
    }

    protected openSocket() {
        clearTimeout(this.openingTimer);
        this.openingTimer = undefined;
        if (!this.socket) {
            console.log(`Trying to connect to server ${this.serverUrl}`);
            this.isLoggedIn = false;
            this.socket = new WebSocket(this.serverUrl);
            this.socket.binaryType = "arraybuffer";
            this.socket.addEventListener("open", this._socketOpenBound);
            this.socket.addEventListener("error", this._socketErrorBound);
            this.socket.addEventListener("message", this._socketMessageBound);
            this.socket.addEventListener("close", this._socketCloseBound);
        }
        if (this.socket.readyState == WebSocket.CLOSED || this.socket.readyState == WebSocket.CLOSING) {
            this.removeListeners();
            this.socket = undefined;
            if (this.openingTimer === undefined) {
                this.openingTimer = setTimeout(this.openSocket.bind(this), 1000);
            }
        }
    }

    protected _socketOpenBound = this.socketOpen.bind(this);
    protected socketOpen() {
        console.log("Connection to backend established");
        const loginMsg: WebsocketLoginMessage = {
            type: "login",
            token: this.clientConfigStore?.token
        };
        this.send(loginMsg);
    }

    protected _socketErrorBound = this.socketError.bind(this);
    protected socketError(err: any) {
        console.error("Conection to backend lost due to error: " + err);
    }

    protected _socketMessageBound = this.socketMessage.bind(this);
    protected socketMessage(msgEvent: MessageEvent) {
        if (typeof msgEvent.data != "string") {
            console.warn("Received unexpected websocket binary message");
            return;
        }
        const data = JSON.parse(msgEvent.data) as WebsocketMessage;
        console.log(`Received ${data.type} message from ${this.serverUrl}`);
        switch (data.type) {
            case "clientConfig":
                const clientConfigData = data as WebsocketClientConfigMessage;
                this.remoteServerUuid = clientConfigData.serverUuid;
                this.isLoggedIn = true;
                this.subscribeAndFlushDeferred();
                break;
            case "error":
                this.loginError(data as WebsocketErrorMessage);
        }
        this.onMessage(data);
    }

    protected _socketCloseBound = this.socketClose.bind(this);
    protected socketClose() {
        console.warn("Connection to backend was closed.");
        if (this.socket) {
            this.openSocket();
        }
    }

    protected loginError(msg: WebsocketErrorMessage) {
        if (msg.relatesTo?.type == "login" && !this.isLoggedIn) {
            console.log(`Login failed: ${msg.message}`);
            const tryAgain = confirm(`Login failed with error: ${msg.message}.\nTry again as new client (clears client config)?`);
            if (tryAgain) {
                const loginMsg: WebsocketLoginMessage = {
                    type: "login",
                    token: ""
                };
                this.send(loginMsg);
            }
        }
    }

    protected subscribeAndFlushDeferred() {
        const subscribeMsg: WebsocketSubscribeMessage = {
            type: "subscribe",
            topics: this.getSubscriptions()
        }
        this.send(subscribeMsg);
        while (this.deferredMessages.length > 0) {
            this.send(this.deferredMessages.pop()!!);
        }
    }

    send(message: WebsocketMessage) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN && (this.isLoggedIn || message.type == "login")) {
            this.socket.send(JSON.stringify(message));
        } else {
            if (message.type !== "subscribe" && message.type !== "login") {
                this.deferredMessages.splice(0, 0, message);
                this.openSocket();
            }
        }
    }

    close() {
        console.log(`Closing server connection to ${this.serverUrl}`);
        this.removeListeners();
        this.socket?.close();
        this.socket = undefined;
    }

    protected removeListeners() {
        this.socket?.removeEventListener("open", this._socketOpenBound);
        this.socket?.removeEventListener("error", this._socketErrorBound);
        this.socket?.removeEventListener("message", this._socketMessageBound);
        this.socket?.removeEventListener("close", this._socketCloseBound);
    }

    get serverUuid(): string | undefined {
        return this.remoteServerUuid;
    }

    get isOpen(): boolean {
        return this.socket?.readyState == WebSocket.OPEN;
    }
}