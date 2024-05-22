import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./Topic.js";
import { Client } from "./Client.js";

@Entity()
export class DataKey {

    /*@PrimaryGeneratedColumn("uuid")
    dataKeyUuid: string = ""*/

    @PrimaryColumn()
    key: string = ""

    @Column({ type: "simple-json" })
    value: any;

    @PrimaryColumn({ type: "string", name: "topicId", nullable: false })
    @ManyToOne(() => Topic, topic => topic.dataKeys)
    @JoinColumn()
    topic: Promise<Topic> = Promise.reject();
    topicId: string = "";

    @Column()
    version: number = -1;

    @ManyToOne(() => Client)
    createdBy: Promise<Client | null> = Promise.resolve(null);
}