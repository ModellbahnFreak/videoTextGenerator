import { Topic } from "./Topic.js";
import { ClientSocket } from "../controller/ClientSocket.js";
import { Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { uuidGenerator } from "../utils.js";

type WebSocketMetadata = {};

@Entity()
export class Client {

    @PrimaryColumn()
    public readonly uuid: string = uuidGenerator();

    @ManyToMany(() => Topic)
    @JoinTable()
    protected readonly topicSubscriptions: Promise<Topic[]> = Promise.resolve([]);
}