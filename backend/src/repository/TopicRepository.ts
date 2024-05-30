import { Repository } from "typeorm";
import { Topic } from "../model/Topic.js";
import dataSource from "../dataSource.js";

export interface TopicRepository extends Repository<Topic> {
    /**
     * Atomically Creates the specified topic in database if it doesn't exist
     * 
     * CAUTION: Relatively slow (always does an insert or update)
     */
    createIfNotExists(topic: Omit<Topic, "dataKeys">): Promise<Topic>;
}

export const topicRepository: TopicRepository = dataSource.getRepository(Topic).extend({
    async createIfNotExists(topic: Omit<Topic, "dataKeys">): Promise<Topic> {
        const existing = await this.findOneBy({
            idOrName: topic.idOrName
        });
        if (existing) {
            return existing;
        }
        await this.createQueryBuilder()
            .insert()
            .values(topic)
            .orUpdate(["idOrName"])
            .execute();
        return await this.findOneByOrFail({
            idOrName: topic.idOrName
        });
    }
} as TopicRepository);