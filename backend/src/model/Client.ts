import { Topic } from "./Topic.js";
import { ClientSocket } from "../controller/ClientSocket.js";
import { Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

type WebSocketMetadata = {};

@Entity()
export class Client {

    @PrimaryGeneratedColumn("uuid")
    public readonly uuid: string = "";

    @ManyToMany(() => Topic)
    @JoinTable()
    protected readonly topicSubscriptions: Promise<Topic[]> = Promise.resolve([]);
}