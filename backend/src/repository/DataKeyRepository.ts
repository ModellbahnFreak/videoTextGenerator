import { Repository } from "typeorm";
import { DataKey } from "../model/DataKey.js";
import { Topic } from "../model/Topic.js";

export interface DataKeyRepository extends Repository<DataKey<unknown>> {
    findByName(topic: Topic | string, dataKey: string): Promise<DataKey<unknown> | undefined>;
    saveDataKey(dataKey: DataKey<unknown>): Promise<void>
}