import type { APIBase, DataKey as IDataKey, ListenerOptions, ROConsumer } from "@videotextgenerator/api"
import { BackendDataKey } from "../data/BackendDataKey.js";
import { DataKeyManager } from "../data/DataKeyManager.js";
import { EventManager } from "../data/EventManager.js";

export class BackendAPI implements APIBase {

    constructor(
        protected readonly pluginUuid: string,
        protected readonly dataKeyManager: DataKeyManager,
        protected readonly eventManager: EventManager,
    ) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<IDataKey<T> | null> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return this.dataKeyManager.for<T>(topic ?? this.pluginUuid, keyName);
    }

    on<T>(event: string, listener: ROConsumer<T>, topic: string = this.pluginUuid): void {
        this.eventManager.on(listener as ROConsumer<unknown>, {
            topic,
            dataKeyOrEvent: event
        })
    }
    off<T>(event: string, listener: ROConsumer<T>, topic: string = this.pluginUuid): void {
        this.eventManager.off(listener as ROConsumer<unknown>, {
            topic,
            dataKeyOrEvent: event
        })
    }
}