import { DataKeyListener, EventListener, ListenerOptions } from "@videotextgenerator/api";
import { Client } from "../model/Client.js";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";
import { DataKeyRepository } from "../repository/DataKeyRepository.js";
import { TopicRepository } from "../repository/TopicRepository.js";
import { BackendDataKey } from "./BackendDataKey.js";

export class DataKeyManager {
    protected readonly instances: BackendDataKey<unknown>[] = [];

    protected readonly dataKeyListeners: Map<DataKeyListener, ListenerOptions> = new Map();
    protected readonly eventListeners: Map<EventListener, ListenerOptions> = new Map();

    constructor(
        protected readonly topicRepository: TopicRepository,
        protected readonly dataKeyRepository: DataKeyRepository,
        protected readonly serverClient: Client,
    ) {

    }

    public async for<T>(topic: string, dataKey: string, requestingClient: Client = this.serverClient): Promise<BackendDataKey<T> | null> {
        //todo: requesting client can be used for permission check
        if (topic == "" || dataKey == "") {
            throw new Error("Illegal Arguments. Need topic and data key");
        }
        console.log(`Requested dataKey ${topic}/d-${dataKey}`);
        let instance = this.instances.filter(i => i.topic == topic && i.key == dataKey)[0];
        if (!instance) {
            let topicInstance = await this.topicRepository.findOneBy({ idOrName: topic });
            if (!topicInstance) {
                topicInstance = new Topic();
                topicInstance.idOrName = topic;
                topicInstance = await this.topicRepository.save(topicInstance);
            }
            let dataKeyInstance = await this.dataKeyRepository.findByName(topicInstance, dataKey);
            if (!dataKeyInstance) {
                dataKeyInstance = new DataKey();
                dataKeyInstance.key = dataKey;
                dataKeyInstance.topic = Promise.resolve(topicInstance);
                dataKeyInstance.topicIdOrName = topicInstance.idOrName;
                dataKeyInstance.value = null;
                dataKeyInstance = await this.dataKeyRepository.save(dataKeyInstance);
            }
            instance = new BackendDataKey(dataKeyInstance);
            this.instances.push(instance);
        }
        return instance as BackendDataKey<T>;
    }

    public async received(topic: string, dataKey: string, value: unknown, version: number, fromClient: Client): Promise<boolean> {
        const dataKeyInstance = await this.for(topic, dataKey, fromClient);
        if (!dataKeyInstance) {
            return false;
        }
        await dataKeyInstance.received(value, version, fromClient);
        return true;
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
}