import { DataKeyListener, EventListener, ListenerOptions } from "@videotextgenerator/api";
import { Client } from "../model/Client.js";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";
import type { DataKeyRepository } from "../repository/DataKeyRepository.js";
import type { TopicRepository } from "../repository/TopicRepository.js";
import { BackendDataKey } from "./BackendDataKey.js";
import type { TopicPermissionRepository } from "../repository/TopicPermissionRepository.js";
import { Access, TopicPermission } from "../model/TopicPermission.js";
import { IsNull, SelectQueryBuilder } from "typeorm";

export class DataKeyManager {
    protected readonly instances: Map<string, Map<string, BackendDataKey<unknown>>> = new Map();

    protected readonly dataKeyListeners: Map<DataKeyListener, ListenerOptions> = new Map();

    constructor(
        protected readonly topicRepository: TopicRepository,
        protected readonly dataKeyRepository: DataKeyRepository,
        protected readonly topicPermissionRepository: TopicPermissionRepository,
        protected readonly serverClient: Client,
    ) {

    }

    protected async clientMayAccess(topic: string, client: Client): Promise<boolean> {
        return client.uuid == this.serverClient.uuid ||
            (((await this.topicPermissionRepository.clientPermission(topic, client.uuid)) & Access.READ) === Access.READ)
    }

    /**
     * Returns a list of topic ids that are known to the server and that may be accessed by the specified client
     * 
     * TOPIC ACCESS PROTECTED
     * 
     * @param requestingClient The client that initiated the request. This determines which topics are visible
     */
    public async getKnownTopics(requestingClient: Client = this.serverClient): Promise<string[]> {
        if (
            requestingClient.uuid == this.serverClient.uuid ||
            (requestingClient.defaultAccess & Access.READ) === Access.READ
        ) {
            const topics: Topic[] = await this.topicRepository.createQueryBuilder("topic")
                .select(["idOrName"])
                .leftJoin("topic.permissions", "permission_join",
                    "permission_join.clientUuid = :clientUuid and (permission_join.access is null or (permission_join.access & :read) = :read)"
                    , {
                        clientUuid: "8febea88-55c1-c26d-5624-c9655ddbbaa8",
                        read: Access.READ
                    })
                .execute();
            console.log("Allowing access to topics: ", topics);
            return topics.map(topic => topic.idOrName);
        } else {
            const topicPermissions: TopicPermission[] = await this.topicPermissionRepository.createQueryBuilder("topic_permission")
                .select(["topicIdOrName"])
                .where({ clientUuid: requestingClient.uuid })
                .andWhere("(topic_permission.access & :read) = :read", {
                    read: Access.READ
                })
                .execute();
            console.log("Restricted topics access: ", topicPermissions);
            return topicPermissions.map(perm => perm.topicIdOrName);
        }
    }

    /**
     * Returns all known data key names/keys for the specified topic IFF the specified client may access the topic.
     * Empty list otherwise.
     * 
     * TOPIC ACCESS PROTECTED
     * 
     * @param topic The topic for which to return the data keys
     * @param requestingClient The client initiating the request
     * @returns A list of data key names
     */
    public async getKnownDataKeys(topic: string, requestingClient: Client = this.serverClient): Promise<string[]> {
        if (!await this.clientMayAccess(topic, requestingClient)) {
            return [];
        }

        const dataKeys = await this.dataKeyRepository.find({
            select: { key: true },
            where: { topicIdOrName: topic }
        });
        return dataKeys.map(d => d.key);
    }

    /**
     * Returns all known data key instances for the specified topic IFF the specified client may access the topic.
     * Empty list otherwise.
     * 
     * TOPIC ACCESS PROTECTED
     * 
     * @param topic The topic for which to return the data keys
     * @param requestingClient The client initiating the request
     * @returns A list of backend data key instances
     */
    public async allKnownFor(topic: string, requestingClient: Client = this.serverClient): Promise<BackendDataKey<unknown>[]> {
        if (!await this.clientMayAccess(topic, requestingClient)) {
            return [];
        }

        if (topic == "") {
            throw new Error("Illegal Arguments. Need topic.");
        }
        let topicInstances = this.instances.get(topic);
        if (!topicInstances) {
            topicInstances = new Map();
            this.instances.set(topic, topicInstances);
            await this.topicRepository.createIfNotExists({ idOrName: topic });
        }

        const instances = (await this.getKnownDataKeys(topic, requestingClient)).map(dataKey => {
            let instance = topicInstances.get(dataKey);
            if (!instance) {
                instance = new BackendDataKey({
                    topicIdOrName: topic, key: dataKey
                }, this.dataKeyRepository, this.serverClient);
                topicInstances.set(dataKey, instance);

                for (const [listener, options] of this.dataKeyListeners) {
                    if ((!options.topic || options.topic == topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == dataKey)) {
                        instance.on(listener, options.once);
                    }
                }
            }
            return instance;
        });
        await Promise.all(instances.map(instance => instance.isInitialized));
        return instances;
    }

    public async for<T>(topic: string, dataKey: string, requestingClient: Client = this.serverClient): Promise<BackendDataKey<T> | null> {
        if (!await this.clientMayAccess(topic, requestingClient)) {
            return null;
        }

        if (topic == "" || dataKey == "") {
            throw new Error("Illegal Arguments. Need topic and data key");
        }
        console.log(`Requested dataKey ${topic}/d-${dataKey}`);

        let topicInstances = this.instances.get(topic);
        if (!topicInstances) {
            topicInstances = new Map();
            this.instances.set(topic, topicInstances);
            await this.topicRepository.createIfNotExists({ idOrName: topic });
        }
        let instance = topicInstances.get(dataKey);
        if (!instance) {
            instance = new BackendDataKey({
                topicIdOrName: topic, key: dataKey
            }, this.dataKeyRepository, this.serverClient);
            topicInstances.set(dataKey, instance);
            await instance.isInitialized;

            for (const [listener, options] of this.dataKeyListeners) {
                if ((!options.topic || options.topic == topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == dataKey)) {
                    instance.on(listener, options.once);
                }
            }
        }
        return instance as BackendDataKey<T>;
    }

    public async received(topic: string, dataKey: string, value: unknown, version: number, subversion: number, fromClient: Client): Promise<boolean> {
        //todo: check write permission
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
        for (const topicInstances of this.instances.values()) {
            for (const instance of topicInstances.values()) {
                if ((!options.topic || options.topic == instance.topic) && (!options.dataKeyOrEvent || options.dataKeyOrEvent == instance.key)) {
                    instance.on(listener, options.once);
                }
            }
        }

    }

    off(listener: DataKeyListener): void {
        this.dataKeyListeners.delete(listener);
        for (const topicInstances of this.instances.values()) {
            for (const instance of topicInstances.values()) {
                instance.off(listener);
            }
        }
    }
}