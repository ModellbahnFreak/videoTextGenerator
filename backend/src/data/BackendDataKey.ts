import type { DataKeyListener, DataKey as IDatakKey, ROConsumer } from "@videotextgenerator/api";
import { DataKey } from "../model/DataKey.js";
import { Client, ClientType } from "../model/Client.js";
import type { DataKeyRepository } from "../repository/DataKeyRepository.js";

export class BackendDataKey<T> implements IDatakKey<T> {

    protected dataKey: DataKey;

    protected readonly listeners: Map<ROConsumer<T> | DataKeyListener, boolean> = new Map();

    constructor(
        dataKey: DataKey,
        protected readonly dataKeyRepository: DataKeyRepository,
        protected readonly serverClient: Client,
    ) {
        this.dataKey = dataKey;
    }

    get value(): T {
        return this.dataKey.value;
    }

    /**
     * 
     * @returns true iff the data key was recreated in the database (it was missing)
     */
    protected async reload(dataKey?: Omit<Omit<DataKey, "topic">, "createdBy">): Promise<boolean> {
        const reloaded = await this.dataKeyRepository.findByName(this.dataKey.topicIdOrName, this.dataKey.key);
        if (reloaded) {
            if (reloaded.version > this.dataKey.version || (reloaded.version == this.dataKey.version && reloaded.subversion >= this.dataKey.subversion)) {
                this.dataKey = reloaded;
            }
        } else {
            console.warn(`Data key ${this.dataKey.topic}/d-${this.dataKey.key} has been lost from database`);
            this.dataKey = await this.dataKeyRepository.createIfNotExists(dataKey ?? this.dataKey);
            return true;
        }
        return false;
    }

    async set(newValue: T): Promise<void> {
        if (newValue === undefined) {
            newValue = null as T;
        }
        await this.reload();
        await Promise.all([
            this.dataKeyRepository.versionIncrement({
                ...this.dataKey,
                value: newValue,
                createdByUuid: this.serverClient.uuid
            }),
            this.callListeners(newValue)
        ]);
        await this.reload();
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
                (listener as DataKeyListener)(this.topic, this.key, this.value, this.currentVersion, this.currentSubversion);
            }
            if (once) {
                this.listeners.delete(listener);
            }
        }
    }

    async received(value: unknown, version: number, subversion: number, fromClient: Client): Promise<void> {
        // conflic resolution: 
        // - If newVersion > oldVersion => save as newVersion.0
        // - If newVersion == oldVersion and newClient > oldClient => save as oldVersion.(max(oldSubversion + 1, newSubversion))
        // - Optional: if newVersion == oldVersion and newClient == oldClient and newSubversion > oldSubversion => save as oldVersion.(newSubversion)

        // In SQL: Only update, if newVersion > oldVersion or (newVersion == oldVersion && newSubversion > oldSubversion)

        console.log(Date.now() + ": Pre updating");
        const newDataKey = {
            ...this.dataKey,
            value,
            version,
            subversion,
            createdByUuid: fromClient.uuid
        };
        let setSuccess = await this.dataKeyRepository.versionUpdate(newDataKey);
        if (setSuccess || await this.reload(newDataKey)) {
            console.log(Date.now() + ": Updated");
            console.log(`Created version ${this.currentVersion}.${this.currentSubversion} of ${this.dataKey.topicIdOrName}/d-${this.dataKey.key}`);
            this.callListeners();
        } else {
            console.log(Date.now() + ": Not Updated");
            console.log(`No new version as ${this.currentVersion}.${this.currentSubversion} of ${this.dataKey.topicIdOrName}/d-${this.dataKey.key} alsready exists`);
        }

        /*const reloaded = await this.dataKeyRepository.findByName(this.dataKey.topicIdOrName, this.dataKey.key);
        if (reloaded) {
            this.dataKey = reloaded;
        } else {
            console.warn(`Data key ${this.dataKey.topic}/d-${this.dataKey.key} has been lost from database`);
        }
        if (this.dataKey.version < version || (this.dataKey.version > (4294967295 - 5) && version < 5)) {
            this.dataKeyRepository.createQueryBuilder()
                .update()
                .set({ value: value as any, version, createdBy: Promise.resolve(fromClient) })
                .where({ topicIdOrName: this.dataKey.topicIdOrName })

            this.dataKey.version = version;
            this.dataKey.value = value;
            this.dataKey.createdBy = Promise.resolve(fromClient);
            this.dataKeyRepository.save(this.dataKey).then(newDataKey => {
                this.dataKey = newDataKey;
            });
            this.callListeners();
            return;
        }
        if (this.dataKey.version > version) {
            return;
        }
        const currCreatedBy = await this.dataKey.createdBy;
        if (this.dataKey.version == version && !!currCreatedBy && fromClient.compare(currCreatedBy) > 0) {
            this.dataKey.version++;
            this.dataKey.value = value;
            this.dataKey.createdBy = Promise.resolve(fromClient);
            this.dataKey = await this.dataKeyRepository.save(this.dataKey);
            this.callListeners();
            return;
        }*/
    }

    get currentSubversion(): number {
        return this.dataKey.subversion;
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