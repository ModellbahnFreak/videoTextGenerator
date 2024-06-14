import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./Topic.js";
import { Client } from "./Client.js";

export enum Access {
    NONE = 0b000,
    READ = 0b001,
    READ_WRITE = 0b011,
}

@Entity()
export class TopicPermission {

    constructor(topic?: string, clientUuid?: string, access?: Access) {
        if (topic) {
            this.topicIdOrName = topic;
        }
        if (clientUuid) {
            this.clientUuid = clientUuid;
        }
        if (access) {
            this.access = access;
        }
    }

    @ManyToOne(() => Topic)
    @JoinColumn()
    topic: Promise<Topic> = Promise.resolve(new Topic());
    @PrimaryColumn({ nullable: false })
    topicIdOrName: string = "";

    @ManyToOne(() => Client, client => client.topicPermissions)
    client: Promise<Client> = Promise.resolve(new Client());
    @PrimaryColumn({nullable: false})
    clientUuid: string = "";

    @Column()
    access: Access = Access.NONE;
}