import type { DataKeyListener, DataKey as IDatakKey, ROConsumer } from "@videotextgenerator/api";
import { DataKey } from "../model/DataKey.js";
import { Client } from "../model/Client.js";
import { dataKeyRepository } from "../repository/DataKeyRepository.js";

export class BackendDataKey<T> implements IDatakKey<T> {

    protected dataKey: DataKey;

    protected readonly listeners: Map<ROConsumer<T> | DataKeyListener, boolean> = new Map();

    constructor(dataKey: DataKey) {
        this.dataKey = dataKey;
    }

    get value(): T {
        return this.dataKey.value;
    }

    async set(newValue: T): Promise<void> {
        const reloaded = await dataKeyRepository.findByName(this.dataKey.topicIdOrName, this.dataKey.key);
        if (reloaded) {
            this.dataKey = reloaded;
        } else {
            console.warn(`Data key ${this.dataKey.topic}/d-${this.dataKey.key} has been lost from database`);
        }
        this.dataKey.version++;
        this.dataKey.value = newValue;
        this.dataKey.createdBy = Promise.resolve(null);
        this.callListeners(newValue);
    }

    on(handler: ROConsumer<T> | DataKeyListener, once: boolean = false): void {
        this.listeners.set(handler, once);
    }
    off(handler: ROConsumer<T> | DataKeyListener): void {
        this.listeners.delete(handler);
    }
    protected callListeners(value?: T) {
        console.debug(`DataKey ${this.dataKey.topicIdOrName}/d-${this.dataKey.key} changed to version ${this.dataKey.version}`);
        const newValue = value ?? this.value;
        for (const [listener, once] of this.listeners) {
            if (listener.length == 1) {
                (listener as ROConsumer<T>)(newValue);
            } else {
                (listener as DataKeyListener)(this.topic, this.key, this.value, this.currentVersion);
            }
            if (once) {
                this.listeners.delete(listener);
            }
        }
    }

    async received(value: unknown, version: number, fromClient: Client): Promise<void> {
        const reloaded = await dataKeyRepository.findByName(this.dataKey.topicIdOrName, this.dataKey.key);
        if (reloaded) {
            this.dataKey = reloaded;
        } else {
            console.warn(`Data key ${this.dataKey.topic}/d-${this.dataKey.key} has been lost from database`);
        }
        if (this.dataKey.version < version || (this.dataKey.version > (4294967295 - 5) && version < 5)) {
            this.dataKey.version = version;
            this.dataKey.value = value;
            this.dataKey.createdBy = Promise.resolve(fromClient);
            dataKeyRepository.save(this.dataKey).then(newDataKey => {
                this.dataKey = newDataKey;
            });
            this.callListeners();
            return;
        }
        if (this.dataKey.version > version) {
            return;
        }
        const currCreatedBy = await this.dataKey.createdBy;
        if (this.dataKey.version == version && !!currCreatedBy && fromClient.compare(currCreatedBy) > 1) {
            this.dataKey.version++;
            this.dataKey.value = value;
            this.dataKey.createdBy = Promise.resolve(fromClient);
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
        return this.dataKey.topicIdOrName;
    }
    getKey(): string {
        return this.dataKey.key;
    }
    getTopic(): string {
        return this.dataKey.topicIdOrName;
    }
}