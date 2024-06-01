import { Repository } from "typeorm";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";
import dataSource from "../dataSource.js";
import { ClientType } from "../model/Client.js";

export interface DataKeyRepository extends Repository<DataKey> {
    findByName(topic: Topic | string, dataKey: string): Promise<DataKey | null>;
    /**
     * Tries to update the data key in the database to the specified value.
     * Sets the subversion to the max of the saved subversion+1 and the given subversion
     * 
     * Only does so, if:
     * - The given version is greater than the saved version
     * - The given version is the same and the given subversion is greater than the saved subversion
     */
    versionUpdate(dataKey: Omit<Omit<DataKey, "topic">, "createdBy">, compareSubversion?: boolean): Promise<boolean>;

    /**
     * Atomically increments the version and sets the specified values. (Subversion set to 0)
     */
    versionIncrement(dataKey: Omit<Omit<Omit<Omit<DataKey, "topic">, "createdBy">, "version">, "subversion">): Promise<void>;

    /**
     * Atomically Creates the specified dataKey in database if it doesn't exist
     * 
     * CAUTION: Relatively slow (always does an insert or update)
     */
    createIfNotExists(dataKey: Omit<Omit<DataKey, "topic">, "createdBy">): Promise<DataKey>;
}

export const dataKeyRepository: DataKeyRepository = dataSource.getRepository(DataKey).extend({
    async findByName(topic, dataKey) {
        const topicName = typeof topic === "string" ? topic : topic.idOrName;
        return this.findOneBy({
            topicIdOrName: topicName,
            key: dataKey
        });
    },

    async versionUpdate(dataKey: Omit<Omit<DataKey, "topic">, "createdBy">, compareSubversion: boolean = true): Promise<boolean> {
        const res = await this.createQueryBuilder()
            .update()
            .set({
                ...dataKey,
                subversion: () => `(max((1 - min(1, ${dataKey.version}-version)) * subversion, ${isFinite(dataKey.subversion) ? dataKey.subversion : 0})/2 + 1) * 2`
            })
            .where({ key: dataKey.key, topicIdOrName: dataKey.topicIdOrName })
            .andWhere("((version < :newVersion or (version > (4294967295 - 5) and :newVersion < 5)) or (version = :newVersion and createdByUuid < :newCreatedBy))", {
                newVersion: dataKey.version,
                newSubversion: dataKey.subversion,
                newCreatedBy: dataKey.createdByUuid,
                server: ClientType.SERVER
            })
            .execute();
        console.log("Update result: ", res.affected);
        if (compareSubversion && res.affected != 1) {
            const resSubver = await this.createQueryBuilder()
                .update()
                .set({
                    subversion: dataKey.subversion
                })
                .where({ key: dataKey.key, topicIdOrName: dataKey.topicIdOrName })
                .andWhere("(version = :newVersion and createdByUuid = :newCreatedBy and subversion < :newSubversion)", {
                    newVersion: dataKey.version,
                    newSubversion: dataKey.subversion,
                    newCreatedBy: dataKey.createdByUuid
                })
                .execute();
            return resSubver.affected == 1;
        }
        return res.affected == 1;
    },

    async versionIncrement(dataKey: Omit<Omit<Omit<Omit<DataKey, "topic">, "createdBy">, "version">, "subversion">): Promise<void> {
        await this.createQueryBuilder()
            .update()
            .set({
                createdByUuid: dataKey.createdByUuid,
                value: dataKey.value,
                version: () => "version + 1",
                subversion: 0
            })
            .where({ key: dataKey.key, topicIdOrName: dataKey.topicIdOrName })
            .execute();
    },

    async createIfNotExists(dataKey: Omit<Omit<DataKey, "topic">, "createdBy">): Promise<DataKey> {
        const existing = await this.findOneBy({
            topicIdOrName: dataKey.topicIdOrName,
            key: dataKey.key
        });
        if (existing) {
            return existing;
        }
        await this.createQueryBuilder()
            .insert()
            .values(dataKey)
            .orUpdate(["key"])
            .execute();
        return await this.findOneByOrFail({
            topicIdOrName: dataKey.topicIdOrName,
            key: dataKey.key
        });
    }
} as DataKeyRepository);