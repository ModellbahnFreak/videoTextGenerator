import type { APIBase, DataKey, ROConsumer } from "@videotextgenerator/api";
import type { useDataKeyStore } from "./vuePlugins/stores/dataKey";
import type { EventManager } from "./backend/EventManager";

export class FrontendAPI implements APIBase {
    constructor(
        protected readonly pluginUuid: string,
        protected readonly dataKeyStore: ReturnType<typeof useDataKeyStore>,
        protected readonly eventManager: EventManager
    ) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<DataKey<T> | null> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return this.dataKeyStore.dataKeyFor<T>(topic ?? this.pluginUuid, keyName);
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