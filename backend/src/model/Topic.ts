import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DataKey } from "./DataKey.js";

@Entity()
export class Topic {

    @PrimaryColumn()
    idOrName: string

    @OneToMany(() => DataKey, dataKey => dataKey.topic)
    dataKeys: DataKey<unknown>[] = [];

    constructor(pluginUuidOrTopic: string) {
        this.idOrName = pluginUuidOrTopic;
    }
}