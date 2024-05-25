import { Topic } from "./Topic.js";
import { ClientSocket } from "../socket/Socket.js";
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { uuidGenerator } from "../utils.js";
import { DataKey } from "./DataKey.js";

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
            this.uuid = ""
        }
    }

    @BeforeInsert()
    generateUuid() {
        if (this.uuid == "") {
            (this as any).uuid = uuidGenerator();
        }
    }

    @PrimaryColumn()
    public readonly uuid: string;

    @Column({ type: "simple-json", nullable: true })
    public config?: any | null;

    @Column()
    public type: ClientType = ClientType.CLIENT;

    @OneToMany(() => DataKey, dataKey => dataKey.createdBy)
    public createdDataKeys: Promise<DataKey[]> = Promise.resolve([]);

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