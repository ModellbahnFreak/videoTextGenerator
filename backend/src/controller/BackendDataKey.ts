import type { DataKey as IDatakKey, ROConsumer, WebsocketDataKeyMessage } from "@videotextgenerator/api";
import { DataKey } from "../model/DataKey.js";
import { Client } from "../model/Client.js";
import { Topic } from "../model/Topic.js";
import { dataKeyRepository } from "../repository/DataKeyRepository.js";
import { topicRepository } from "../repository/TopicRepository.js";

export class BackendDataKey<T> implements IDatakKey<T> {

    protected dataKey: DataKey;

    protected readonly listeners: Map<ROConsumer<T>, boolean> = new Map();

    protected constructor(dataKey: DataKey) {
        this.dataKey = dataKey;
    }

    get value(): T {
        return this.dataKey.value;
    }

    set(newValue: T): void {
        this.dataKey.version++;
        this.dataKey.value = newValue;
        this.dataKey.createdBy = null;
        this.callListeners(newValue);
    }

    on(handler: ROConsumer<T>): void {
        this.listeners.set(handler, true);
    }
    off(handler: ROConsumer<T>): void {
        this.listeners.delete(handler);
    }
    protected callListeners(value?: T) {
        const newValue = value ?? this.value;
        for (const [listener, _] of this.listeners) {
            listener(newValue);
        }
    }

    async received(msg: WebsocketDataKeyMessage, fromClient: Client | undefined): Promise<void> {
        if (this.dataKey.version < msg.version || (this.dataKey.version > (4294967295 - 5) && msg.version < 5)) {
            this.dataKey.version = msg.version;
            this.dataKey.value = msg.value;
            this.dataKey.createdBy = fromClient ?? null;
            this.dataKey = await dataKeyRepository.save(this.dataKey);
            this.callListeners();
            return;
        }
        if (this.dataKey.version > msg.version) {
            return;
        }
        if (this.dataKey.version == msg.version && !!this.dataKey.createdBy &&
            (!fromClient || fromClient.uuid.localeCompare(this.dataKey.createdBy?.uuid ?? "") > 1)
        ) {
            this.dataKey.version++;
            this.dataKey.value = msg.value;
            this.dataKey.createdBy = fromClient ?? null;
            this.dataKey = await dataKeyRepository.save(this.dataKey);
            this.callListeners();
            return;
        }
    }

    get currentVersion(): number {
        return this.dataKey.version;
    }
    get key(): string {
        return this.dataKey.key;
    }
    get topic(): string {
        return this.dataKey.topicId;
    }

    private static instances: BackendDataKey<unknown>[] = [];
    public static async for<T>(topic: string, dataKey: string): Promise<BackendDataKey<T>> {
        if (topic == "" || dataKey == "") {
            throw new Error("Illegal Arguments. Need topic and data key");
        }
        let instance = BackendDataKey.instances.filter(i => i.topic == topic && i.key == dataKey)[0];
        if (!instance) {
            let topicInstance = await topicRepository.findOneBy({ idOrName: topic });
            if (!topicInstance) {
                topicInstance = new Topic();
                topicInstance.idOrName = topic;
                await topicRepository.save(topicInstance);
            }
            let dataKeyInstance = await dataKeyRepository.findByName(topicInstance, dataKey);
            if (!dataKeyInstance) {
                dataKeyInstance = new DataKey();
                dataKeyInstance.key = dataKey;
                dataKeyInstance.topic = Promise.resolve(topicInstance);
                dataKeyInstance.value = undefined;
                await dataKeyRepository.save(dataKeyInstance);
            }
            instance = new BackendDataKey(dataKeyInstance);
            BackendDataKey.instances.push(instance);
        }
        return instance as BackendDataKey<T>;
    }

    public static async received(msg: WebsocketDataKeyMessage, fromClient: Client | undefined): Promise<void> {
        return (await this.for(msg.topic, msg.dataKey)).received(msg, fromClient);
    }

}