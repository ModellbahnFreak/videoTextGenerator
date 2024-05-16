import { DataKey as IDatakKey, ROConsumer } from "@videotextgenerator/api";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./Topic.js";

@Entity()
export class DataKey<T> implements IDatakKey<T> {

    @PrimaryGeneratedColumn("uuid")
    dataKeyUuid: string = ""

    @Column({ type: "simple-json" })
    value: any;

    @ManyToOne(() => Topic, topic => topic.dataKeys)
    readonly topic: Topic;

    constructor(parentTopic: Topic) {
        this.topic = parentTopic;
    }

    set(newValue: T): void {
        throw new Error("Method not implemented.");
    }
    on(handler: ROConsumer<T>): void {
        throw new Error("Method not implemented.");
    }
    off(handler: ROConsumer<T>): void {
        throw new Error("Method not implemented.");
    }

}