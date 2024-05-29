import type { useClientConfigStore } from "@/vuePlugins/stores/clientConfig";
import { SocketToBackend } from "./SocketToBackend";
import type { App, ObjectPlugin as VuePlugin } from "vue";
import type { DataKeyListener, EventListener, FrontendClientConfig, ListenerOptions, WebsocketClientConfigMessage, WebsocketDataKeyMessage, WebsocketDataKeyRequestMessage, WebsocketEventMessage, WebsocketMessage } from "@videotextgenerator/api";
import type { useDataKeyStore } from "@/vuePlugins/stores/dataKey";
import { uuidGenerator } from "@/utils";

export class SocketsManager implements VuePlugin<[]> {
    protected readonly sockets: SocketToBackend[] = [];

    protected readonly subscribedTopcis: Set<string> = new Set();

    protected readonly dataKeyListeners = new Map<DataKeyListener, ListenerOptions>();
    protected readonly eventListeners = new Map<EventListener, ListenerOptions>();

    constructor(
        protected readonly clientConfigStore: ReturnType<typeof useClientConfigStore>,
        protected readonly dataKeyStore: ReturnType<typeof useDataKeyStore>
    ) {
        this.dataKeyStore.setSocketsManager(this);
    }


    install(app: App<any>) {
        this.closePrevoiusManagers();
        app.config.globalProperties.$socketsManager = this;
        app.provide("socketsManager", this);
        this.startSockets();
    }

    /**
     * Workaround needed for the dev server to not have duplicate sockets
     */
    protected closePrevoiusManagers() {
        const existingManager: SocketsManager = (window as any).socketsManager;
        if (existingManager) {
            console.log(`Found previous manager with ${existingManager.numOpenSockets}/${existingManager.numSockets} open socket. Closing`);
            for (const socket of this.sockets) {
                socket.close();
            }
            existingManager.sockets.splice(0, existingManager.sockets.length);
        }
        (window as any).socketsManager = this;
    }

    protected getClientconfigServerUrls() {
        const specifiedServers = (this.clientConfigStore.config as FrontendClientConfig).servers;
        if (!specifiedServers || specifiedServers.length == 0) {
            return ["/api"];
        }
        return specifiedServers;
    }

    startSockets() {
        if (!this.clientConfigStore.token || this.clientConfigStore.token.length == 0) {
            const server = this.getClientconfigServerUrls()[0];
            const socket = new SocketToBackend(
                this.clientConfigStore,
                this.onMessage.bind(this),
                () => [...this.subscribedTopcis.values()],
                server);
            this.sockets.push(socket);
            console.log(`Only opening socket to ${server} to retrieve client id. Connecting to others later`);
        } else {
            this.openNewSockets();
        }
    }

    openNewSockets() {
        const existingServers = this.sockets.map(socket => socket.serverUrl);
        const newServers = this.getClientconfigServerUrls().filter(server => !existingServers.includes(server));
        for (const server of newServers) {
            const socket = new SocketToBackend(
                this.clientConfigStore,
                this.onMessage.bind(this),
                () => [...this.subscribedTopcis.values()],
                server);
            this.sockets.push(socket);
        }
    }

    closeNotSpecifiedSockets() {
        const specifiedServers = this.getClientconfigServerUrls();
        for (let i = 0; i < this.sockets.length; i++) {
            if (!specifiedServers.includes(this.sockets[i].serverUrl)) {
                this.sockets[i].close();
                this.sockets.splice(i, 1);
                i--;
            }
        }
    }

    onMessage(data: WebsocketMessage) {
        switch (data.type) {
            case "clientConfig":
                this.clientConfigStore.receivedConfig(data as WebsocketClientConfigMessage);
                this.closeNotSpecifiedSockets();
                this.openNewSockets();
                break;
            case "dataKey":
                const dataKeyEvent = data as WebsocketDataKeyMessage;
                for (const [listener, options] of this.dataKeyListeners) {
                    if ((!options.topic || options.topic == dataKeyEvent.topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == dataKeyEvent.dataKey)) {
                        listener(dataKeyEvent.topic, dataKeyEvent.dataKey, dataKeyEvent.value, dataKeyEvent.version);
                        if (options.once === true) {
                            this.dataKeyListeners.delete(listener);
                        }
                    }
                }
                break;
            case "event":
                const eventEvent = data as WebsocketEventMessage;
                for (const [listener, options] of this.eventListeners) {
                    if ((!options.topic || options.topic == eventEvent.topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == eventEvent.event)) {
                        listener(eventEvent.topic, eventEvent.event, eventEvent.payload, eventEvent.evtUuid);
                        if (options.once === true) {
                            this.eventListeners.delete(listener);
                        }
                    }
                }
                break;
        }
    }

    event: EventListener = (topic, event, payload, eventUuid) => {
        const uuid = eventUuid ?? uuidGenerator();
        const eventMsg: WebsocketEventMessage = {
            type: "event",
            topic, event, evtUuid: uuid,
            payload
        }
        this.send(eventMsg);
    }

    dataKey: DataKeyListener = (topic, dataKey, value, version) => {
        const dataKeyMsg: WebsocketDataKeyMessage = {
            type: "dataKey",
            topic, dataKey, version,
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
            let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
            const listener: DataKeyListener = (receivedTopic, receivedDataKey, value) => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                resolve(value);
            }
            if (this.numOpenSockets > 0) {
                this.on("dataKey", listener, { topic, dataKeyOrEvent: dataKey, once: true });
                timeout = setTimeout(() => {
                    this.off("dataKey", listener);
                    console.warn(`Timeout waiting for response to dataKeyRequest ${topic}.${dataKey} was reached`);
                    resolve(undefined);
                }, 1000);
                this.send(dataKeyMsg);
            } else {
                this.send(dataKeyMsg);
                console.log(`Not waiting for request reply due to not being connected`);
                resolve(undefined);
            }
        });
    }

    send(message: WebsocketMessage) {
        console.log(`Sending ${message.type} message:`, message);
        if (message.type !== "subscribe" && (message as WebsocketDataKeyMessage).topic !== undefined) {
            this.subscribedTopcis.add((message as WebsocketDataKeyMessage).topic);
        }
        for (const socket of this.sockets) {
            socket.send(message);
        }
    }

    on(event: "dataKey", listener: DataKeyListener, options?: Partial<ListenerOptions>): void;
    on(event: "event", listener: EventListener, options?: Partial<ListenerOptions>): void;
    on(event: string, listener: DataKeyListener | EventListener, options: Partial<ListenerOptions> = {}): void {
        const optionsWithDefault: ListenerOptions = {
            once: false,
            topic: undefined,
            dataKeyOrEvent: undefined,
            ...options
        }
        switch (event) {
            case "dataKey":
                this.dataKeyListeners.set(listener as DataKeyListener, optionsWithDefault);
                break;
            case "event":
                this.eventListeners.set(listener as EventListener, optionsWithDefault);
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

    get numSockets(): number {
        return this.sockets.length;
    }

    get numOpenSockets(): number {
        return this.sockets.filter(socket => socket.isOpen).length;
    }
}

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        /**
         * Access to the global SocketsManager
         */
        $socketsManager: SocketsManager
    }
}