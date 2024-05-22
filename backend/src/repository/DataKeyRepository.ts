import { Repository } from "typeorm";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";
import dataSource from "../dataSource.js";

export interface DataKeyRepository extends Repository<DataKey> {
    findByName(topic: Topic | string, dataKey: string): Promise<DataKey | null>;
}

export const dataKeyRepository: DataKeyRepository = dataSource.getRepository(DataKey).extend({
    async findByName(topic, dataKey) {
        const topicName = typeof topic === "string" ? topic : topic.idOrName;
        return this.findOneBy({
            topic: { idOrName: topicName },
            key: dataKey
        });
    },
} as DataKeyRepository);