import type { WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketEventMessage, WebsocketMessage } from "@videotextgenerator/api"

export type DataKeyListener = (pluginUuid: string, dataKey: string, payload: unknown) => void;
export type EventListener = (pluginUuid: string, event: string, payload: unknown) => void;

export class SocketToBackend {
    protected socket: WebSocket | undefined;
    protected openingTimer: ReturnType<typeof setTimeout> | undefined;

    protected readonly deferredMessages: WebsocketMessage[] = [];
    protected readonly dataKeyListeners = new Map<DataKeyListener, boolean>();
    protected readonly eventListeners = new Map<EventListener, boolean>();

    constructor() {
        this.openSocket();
    }

    protected openSocket() {
        console.log("Trying to connect to server");
        clearTimeout(this.openingTimer);
        this.openingTimer = undefined;
        if (!this.socket) {
            this.socket = new WebSocket("/api");
            this.socket.binaryType = "arraybuffer";
            this.socket.addEventListener("open", this.socketOpen.bind(this));
            this.socket.addEventListener("error", this.socketError.bind(this));
            this.socket.addEventListener("message", this.socketMessage.bind(this));
            this.socket.addEventListener("close", this.socketClose.bind(this));
        }
        if (this.socket.readyState == WebSocket.CLOSED || this.socket.readyState == WebSocket.CLOSING) {
            this.socket = undefined;
            if (this.openingTimer === undefined) {
                this.openingTimer = setTimeout(this.openSocket.bind(this), 1000);
            }
        }
    }

    protected socketOpen() {
        console.log("Connection to backend established");
        while (this.deferredMessages.length > 0) {
            this.send(this.deferredMessages.pop()!!);
        }
    }

    protected socketError(err: any) {
        console.error("Conection to backend lost due to error: " + err);
    }

    protected socketMessage(msgEvent: MessageEvent) {
        if (typeof msgEvent.data != "string") {
            console.warn("Received unexpected websocket binary message");
            return;
        }
        const data = JSON.parse(msgEvent.data) as WebsocketMessage;
        switch (data.type) {
            case "dataKey":
                const dataKeyEvent = data as WebsocketDataKeyMessage;
                for (const [listener, once] of this.dataKeyListeners) {
                    listener(dataKeyEvent.uuid, dataKeyEvent.dataKey, dataKeyEvent.value);
                    if (once === true) {
                        this.dataKeyListeners.delete(listener);
                    }
                }
                break;
            case "event":
                const eventEvent = data as WebsocketEventMessage;
                for (const [listener, once] of this.eventListeners) {
                    listener(eventEvent.uuid, eventEvent.event, eventEvent.payload);
                    if (once === true) {
                        this.dataKeyListeners.delete(listener);
                    }
                }
                break;
        }
    }

    protected socketClose() {
        console.error("Connection to backend was closed.");
        this.openSocket();
    }

    send(message: WebsocketMessage) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.deferredMessages.splice(0, 0, message);
            this.openSocket();
        }
    }

    event: EventListener = (uuid, event, payload) => {
        const eventMsg: WebsocketEventMessage = {
            type: "event",
            uuid, event,
            payload
        }
        this.send(eventMsg);
    }

    dataKey: DataKeyListener = (uuid, dataKey, value) => {
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            uuid, dataKey,
            value
        }
        this.send(dataKeyMsg);
    }

    async dataKeyRequest(pluginUuid: string, dataKey: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const dataKeyMsg: WebsocketDataKeyRequestMessage = {
                type: "dataKeyRequest",
                uuid: pluginUuid, dataKey
            }
            const listener: DataKeyListener = (receivedUuid, receivedDataKey, value) => {
                if (receivedUuid == pluginUuid && receivedDataKey == dataKey) {
                    this.off("dataKey", listener);
                    resolve(value);
                }
            }
            this.on("dataKey", listener);
            setTimeout(() => {
                this.off("dataKey", listener);
                reject("Timeout waiting for response to dataKeyRequest was reached");
            }, 1000);
            this.send(dataKeyMsg);
        });
    }

    on(event: "dataKey", listener: DataKeyListener, once?: boolean): void;
    on(event: "event", listener: EventListener, once?: boolean): void;
    on(event: string, listener: DataKeyListener | EventListener, once: boolean = false): void {
        switch (event) {
            case "dataKey":
                this.dataKeyListeners.set(listener, once);
                break;
            case "event":
                this.eventListeners.set(listener, once);
                break;
        }
    }

    off(event: "dataKey", listener: DataKeyListener): void;
    off(event: "event", listener: EventListener): void;
    off(event: string, listener: DataKeyListener | EventListener): void {
        switch (event) {
            case "dataKey":
                this.dataKeyListeners.delete(listener);
                break;
            case "event":
                this.eventListeners.delete(listener);
                break;
        }
    }
}

export const SOCKET_INSTANCE = new SocketToBackend();