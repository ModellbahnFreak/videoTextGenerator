import type { DataKey as IDatakKey, ROConsumer, WebsocketDataKeyMessage } from "@videotextgenerator/api";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./Topic.js";
import { Client } from "./Client.js";

@Entity()
export class DataKey<T> implements IDatakKey<T> {

    @PrimaryGeneratedColumn("uuid")
    dataKeyUuid: string = ""

    @Column({ type: "simple-json" })
    value: any;

    @ManyToOne(() => Topic, topic => topic.dataKeys)
    readonly topic: Topic;

    @Column()
    protected version: number = -1;

    @ManyToOne(() => Client)
    protected createdBy: Client | null = null;

    protected readonly listeners: Map<ROConsumer<T>, boolean> = new Map();

    constructor(parentTopic: Topic) {
        this.topic = parentTopic;
    }

    set(newValue: T): void {
        this.version++;
        this.value = newValue;
        this.createdBy = null;
    }

    on(handler: ROConsumer<T>): void {
        this.listeners.set(handler, true);
    }
    off(handler: ROConsumer<T>): void {
        this.listeners.delete(handler);
    }
    protected callListeners() {
        const newValue = this.value;
        for (const [listener, _] of this.listeners) {
            listener(newValue);
        }
    }

    received(msg: WebsocketDataKeyMessage, fromClient: Client | undefined): void {
        if (this.version < msg.version || (this.version > (4294967295 - 5) && msg.version < 5)) {
            this.version = msg.version;
            this.value = msg.value;
            this.createdBy = fromClient ?? null;
            this.callListeners();
            return;
        }
        if (this.version > msg.version) {
            return;
        }
        if (this.version == msg.version && !!this.createdBy &&
            (!fromClient || fromClient.uuid.localeCompare(this.createdBy?.uuid ?? "") > 1)
        ) {
            this.version++;
            this.value = msg.value;
            this.createdBy = fromClient ?? null;
            this.callListeners();
            return;
        }
    }

    get currentVersion(): number {
        return this.version;
    }

}