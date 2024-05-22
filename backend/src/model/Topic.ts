import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DataKey } from "./DataKey.js";

@Entity()
export class Topic {

    @PrimaryColumn()
    idOrName: string

    @OneToMany(() => DataKey, dataKey => dataKey.topic)
    dataKeys: Promise<DataKey<unknown>[]> = Promise.resolve([]);

    constructor(pluginUuidOrTopic: string) {
        this.idOrName = pluginUuidOrTopic;
    }
}