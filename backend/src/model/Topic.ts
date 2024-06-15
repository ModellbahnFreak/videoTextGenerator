import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DataKey } from "./DataKey.js";
import { TopicPermission } from "./TopicPermission.js";

@Entity()
export class Topic {

    @PrimaryColumn({})
    idOrName: string = ""

    @OneToMany(() => DataKey, dataKey => dataKey.topic)
    dataKeys: Promise<DataKey[]> = Promise.resolve([]);

    @OneToMany(() => TopicPermission, permission => permission.topic)
    permissions: Promise<TopicPermission[]> = Promise.resolve([]);
}