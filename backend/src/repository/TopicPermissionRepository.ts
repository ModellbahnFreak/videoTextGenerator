import { Repository } from "typeorm";
import dataSource from "../dataSource.js";
import { Access, TopicPermission } from "../model/TopicPermission.js";
import { Client } from "../model/Client.js";

export interface TopicPermissionRepository extends Repository<TopicPermission> {
    /**
     * Atomically Creates the specified topicPermission in database if it doesn't exist
     * 
     * CAUTION: Relatively slow (always does an insert or update)
     */
    createIfNotExists(topicPermission: Omit<Omit<TopicPermission, "client">, "topic">): Promise<TopicPermission>;

    clientPermission(topic: string, clientUuid: string): Promise<Access>;
}

export const topicPermissionRepository: TopicPermissionRepository = dataSource.getRepository(TopicPermission).extend({
    async createIfNotExists(topicPermission: Omit<Omit<TopicPermission, "client">, "topic">): Promise<TopicPermission> {
        const existing = await this.findOneBy({
            topicIdOrName: topicPermission.topicIdOrName,
            clientUuid: topicPermission.clientUuid,
        });
        if (existing) {
            return existing;
        }
        await this.createQueryBuilder()
            .insert()
            .values(topicPermission)
            .orUpdate(["clientUuid"])
            .execute();
        return await this.findOneByOrFail({
            topicIdOrName: topicPermission.topicIdOrName,
            clientUuid: topicPermission.clientUuid,
        });
    },

    async clientPermission(topic: string, clientUuid: string): Promise<Access> {
        // todo: query permissions for all clients, use that for sending of data keys => reduces requests
        const result: { defaultAccess: Access, access: Access }[] = await this.manager.createQueryBuilder(Client, "client")
            .select("client.defaultAccess", "defaultAccess")
            .where({
                uuid: clientUuid
            })
            .leftJoin("client.topicPermissions", "permissions", "permissions.topicIdOrName = :topicIdOrName", { topicIdOrName: topic })
            .addSelect("permissions.access", "access")
            .limit(1)
            .cache(true)
            .execute();
        if (result.length > 0) {
            return result[0].access ?? result[0].defaultAccess;
        } else {
            return Access.NONE;
        }
    }
} as TopicPermissionRepository);