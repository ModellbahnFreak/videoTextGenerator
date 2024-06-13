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

    constructor(
        protected readonly topicRepository: TopicRepository,
        protected readonly dataKeyRepository: DataKeyRepository,
        protected readonly serverClient: Client,
    ) {

    }

    public async getKnownTopics(): Promise<string[]> {
        const topics = await this.topicRepository.find({
            select: { idOrName: true },
        });
        return topics.map(t => t.idOrName);
    }

    public async getKnownDataKeysFor(topic: string): Promise<string[]> {
        //todo: requesting client can be used for permission check
        const dataKeys = await this.dataKeyRepository.find({
            select: { key: true },
            where: { topicIdOrName: topic }
        });
        return dataKeys.map(d => d.key);
    }

    public async for<T>(topic: string, dataKey: string, requestingClient: Client = this.serverClient): Promise<BackendDataKey<T> | null> {
        //todo: requesting client can be used for permission check
        if (topic == "" || dataKey == "") {
            throw new Error("Illegal Arguments. Need topic and data key");
        }
        console.log(`Requested dataKey ${topic}/d-${dataKey}`);
        let instance = this.instances.filter(i => i.topic == topic && i.key == dataKey)[0];
        if (!instance) {
            await this.topicRepository.createIfNotExists({ idOrName: topic });
            let dataKeyInstance = await this.dataKeyRepository.createIfNotExists({
                key: dataKey,
                topicIdOrName: topic,
                createdByUuid: this.serverClient.uuid,
                version: -1,
                subversion: -1
            })
            instance = new BackendDataKey(dataKeyInstance!!, this.dataKeyRepository, this.serverClient);
            for (const [listener, options] of this.dataKeyListeners) {
                if ((!options.topic || options.topic == topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == dataKey)) {
                    instance.on(listener, options.once);
                }
            }
            this.instances.push(instance);
        }
        return instance as BackendDataKey<T>;
    }

    public async received(topic: string, dataKey: string, value: unknown, version: number, subversion: number, fromClient: Client): Promise<boolean> {
        const dataKeyInstance = await this.for(topic, dataKey, fromClient);
        if (!dataKeyInstance) {
            return false;
        }
        await dataKeyInstance.received(value, version, subversion, fromClient);
        return true;
    }

    // Todo: Fix once not removing on all data keys if triggered on one
    on(listener: DataKeyListener, options: Partial<ListenerOptions> = {}): void {
        const optionsWithDefault: ListenerOptions = {
            once: false,
            topic: undefined,
            dataKeyOrEvent: undefined,
            ...options
        }
        this.dataKeyListeners.set(listener, optionsWithDefault);
        for (const instance of this.instances) {
            if ((!options.topic || options.topic == instance.topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == instance.key)) {
                instance.on(listener, options.once);
            }
        }

    }

    off(listener: DataKeyListener): void {
        this.dataKeyListeners.delete(listener);
        for (const instance of this.instances) {
            instance.off(listener);
        }
    }
}