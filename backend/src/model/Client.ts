import { Topic } from "./Topic.js";
import { ClientSocket } from "../socket/Socket.js";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { uuidGenerator } from "../utils.js";

export enum ClientType {
    SERVER = "server",
    CLIENT = "client"
}

@Entity()
export class Client {

    constructor(setUuid?: string) {
        if (setUuid) {
            this.uuid = setUuid;
        } else {
            this.uuid = uuidGenerator()
        }
    }

    @PrimaryColumn()
    public readonly uuid: string;

    @ManyToMany(() => Topic)
    @JoinTable()
    public readonly topicSubscriptions: Promise<Topic[]> = Promise.resolve([]);

    @Column({ type: "simple-json", nullable: true })
    public config?: any | null;

    @Column()
    public type: ClientType = ClientType.CLIENT;

    compare(to: Client): number {
        if (this === to || this.uuid == to.uuid) {
            return 0;
        }
        if (this.type != to.type) {
            if (this.type == ClientType.SERVER) {
                return Number.MAX_SAFE_INTEGER;
            } else {
                return Number.MIN_SAFE_INTEGER;
            }
        }
        return this.uuid.localeCompare(to.uuid);
    }
}