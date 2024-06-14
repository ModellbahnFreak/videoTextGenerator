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

    clientPermission(topic: string, client: Client): Promise<Access | null>;
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

    async clientPermission(topic: string, client: Client): Promise<Access | null> {
        return (await this.find({
            select: {access: true},
            where: {
                topicIdOrName: topic,
                clientUuid: clientUuid
            }
        }))?.access ?? client.defaultAccess;
    }
} as TopicPermissionRepository);