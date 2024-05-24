import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./Topic.js";
import { Client } from "./Client.js";

@Entity()
export class DataKey {

    /*@PrimaryGeneratedColumn("uuid")
    dataKeyUuid: string = ""*/

    @PrimaryColumn()
    key: string = ""

    @Column({ type: "simple-json", nullable: true })
    value?: any | null;

    @ManyToOne(() => Topic, topic => topic.dataKeys)
    @JoinColumn()
    topic: Promise<Topic> = Promise.resolve(new Topic());
    @PrimaryColumn({ nullable: false })
    topicIdOrName: string = "";

    @Column()
    version: number = -1;

    @ManyToOne(() => Client)
    createdBy: Promise<Client | null> = Promise.resolve(null);
}