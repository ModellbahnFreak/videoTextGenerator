import type { WebsocketClientConfigMessage, WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketEventMessage, WebsocketLoginMessage, WebsocketMessage, WebsocketSubscribeMessage } from "@videotextgenerator/api"
import type { useClientConfigStore } from "./vuePlugins/stores/clientConfig";

export type DataKeyListener = (topic: string, dataKey: string, payload: unknown, version?: number) => void;
export type EventListener = (topic: string, event: string, payload: unknown, eventUuid?: string) => void;

export class SocketToBackend {
    protected socket: WebSocket | undefined;
    protected openingTimer: ReturnType<typeof setTimeout> | undefined;

    protected readonly deferredMessages: WebsocketMessage[] = [];
    protected readonly subscribedTopcis: Set<string> = new Set();

    protected readonly dataKeyVersions: { [topic: string]: { [dataKey: string]: number } } = {};
    protected readonly knownEventIds: { [topic: string]: { [event: string]: Set<string> } } = {};

    protected readonly dataKeyListeners = new Map<DataKeyListener, boolean>();
    protected readonly eventListeners = new Map<EventListener, boolean>();

    public clientConfigStore: ReturnType<typeof useClientConfigStore> | undefined;

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
        const loginMsg: WebsocketLoginMessage = {
            type: "login",
            token: this.clientConfigStore?.token
        };
        this.send(loginMsg);
        for (const topic of this.subscribedTopcis) {
            const subMsg: WebsocketSubscribeMessage = {
                type: "subscribe",
                topic
            }
            this.send(subMsg);
        }
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
            case "clientConfig":
                this.clientConfigStore?.receivedConfig(data as WebsocketClientConfigMessage);
                break;
            case "dataKey":
                const dataKeyEvent = data as WebsocketDataKeyMessage;
                if (this.isDataKeyVersionNew(dataKeyEvent.topic, dataKeyEvent.dataKey, dataKeyEvent.version)) {
                    for (const [listener, once] of this.dataKeyListeners) {
                        listener(dataKeyEvent.topic, dataKeyEvent.dataKey, dataKeyEvent.value, dataKeyEvent.version);
                        if (once === true) {
                            this.dataKeyListeners.delete(listener);
                        }
                    }
                }
                break;
            case "event":
                const eventEvent = data as WebsocketEventMessage;
                if (!this.addKnownEventUuid(eventEvent.topic, eventEvent.event, eventEvent.evtUuid)) {
                    for (const [listener, once] of this.eventListeners) {
                        listener(eventEvent.topic, eventEvent.event, eventEvent.payload, eventEvent.evtUuid);
                        if (once === true) {
                            this.eventListeners.delete(listener);
                        }
                    }
                }
                break;
        }
    }

    protected socketClose() {
        console.error("Connection to backend was closed.");
        this.openSocket();
    }

    protected addKnownEventUuid(topic: string, event: string, uuid: string): boolean {
        if (!this.knownEventIds[topic]) {
            this.knownEventIds[topic] = {};
        }
        if (!this.knownEventIds[topic][event]) {
            this.knownEventIds[topic][event] = new Set();
        }
        const knownSet = this.knownEventIds[topic][event];
        if (!knownSet.has(uuid)) {
            knownSet.add(uuid);
            return false;
        }
        console.log(`Recevied event ${topic}/e${event}/${uuid} again. Not emitting.`);
        return true;
    }

    protected getNextDataKeyVersion(topic: string, dataKey: string): number {
        if (!this.dataKeyVersions[topic]) {
            this.dataKeyVersions[topic] = {};
        }
        if (!this.dataKeyVersions[topic][dataKey]) {
            this.dataKeyVersions[topic][dataKey] = 0;
        }
        return ++this.dataKeyVersions[topic][dataKey];
    }

    protected isDataKeyVersionNew(topic: string, dataKey: string, version: number): boolean {
        if (!this.dataKeyVersions[topic]) {
            this.dataKeyVersions[topic] = {};
        }
        const oldVersion = this.dataKeyVersions[topic][dataKey];
        this.dataKeyVersions[topic][dataKey] = version;
        const isNew = oldVersion === undefined ||
            oldVersion < version ||
            (oldVersion > (4294967295 - 5) && version < 5);
        if (!isNew) {
            console.log(`Recevied dataKey ${topic}/d${dataKey}/${version} again. Not emitting.`);
        }
        return isNew;
    }

    send(message: WebsocketMessage) {
        if (this.socket && this.socket.readyState == WebSocket.OPEN) {
            if (message.type !== "subscribe" && (message as WebsocketDataKeyMessage).topic !== undefined) {
                this.subscribedTopcis.add((message as WebsocketDataKeyMessage).topic);
            }
            this.socket.send(JSON.stringify(message));
        } else {
            if (message.type !== "subscribe" && message.type !== "login") {
                this.deferredMessages.splice(0, 0, message);
                this.openSocket();
            }
        }
    }

    event: EventListener = (topic, event, payload, eventUuid) => {
        const uuid = eventUuid ?? uuidGenerator();
        if (!this.addKnownEventUuid(topic, event, uuid)) {
            const eventMsg: WebsocketEventMessage = {
                type: "event",
                topic, event, evtUuid: uuid,
                payload
            }
            this.send(eventMsg);
        }
    }

    dataKey: DataKeyListener = (topic, dataKey, value, version) => {
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            topic, dataKey, version: this.getNextDataKeyVersion(topic, dataKey),
            value
        }
        this.send(dataKeyMsg);
    }

    async dataKeyRequest(topic: string, dataKey: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const dataKeyMsg: WebsocketDataKeyRequestMessage = {
                type: "dataKeyRequest",
                topic, dataKey
            }
            const listener: DataKeyListener = (receivedTopic, receivedDataKey, value) => {
                if (receivedTopic == topic && receivedDataKey == dataKey) {
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
                this.dataKeyListeners.set(listener as DataKeyListener, once);
                break;
            case "event":
                this.eventListeners.set(listener as EventListener, once);
                break;
        }
    }

    off(event: "dataKey", listener: DataKeyListener): void;
    off(event: "event", listener: EventListener): void;
    off(event: string, listener: DataKeyListener | EventListener): void {
        switch (event) {
            case "dataKey":
                this.dataKeyListeners.delete(listener as DataKeyListener);
                break;
            case "event":
                this.eventListeners.delete(listener as EventListener);
                break;
        }
    }
}

function hex4DigitRnd(): string {
    return Math.random().toString(16).substring(2, 6).padEnd(4, "0");
}

function uuidGenerator(): string {
    let uuid = "";
    uuid += hex4DigitRnd() + hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + hex4DigitRnd() + hex4DigitRnd();
    return uuid;
}

export const SOCKET_INSTANCE = new SocketToBackend();