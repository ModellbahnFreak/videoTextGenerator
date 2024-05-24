import type { APIBase, DataKey } from "@videotextgenerator/api";
import type { useDataKeyStore } from "./vuePlugins/stores/dataKey";
import type { SocketsManager } from "./backend/SocketsManager";

export class FrontendAPI implements APIBase {
    constructor(
        protected readonly pluginUuid: string,
        protected readonly dataKeyStore: ReturnType<typeof useDataKeyStore>,
        protected readonly socketsManager: SocketsManager,
    ) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<DataKey<T>> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return this.dataKeyStore.dataKeyFor<T>(topic ?? this.pluginUuid, keyName);
    }

    on<T>(event: string, listener: (payload: T) => void, topic?: string | undefined): void {
        throw new Error("Method not implemented.");
    }

    off<T>(event: string, listener: (payload: T) => void, topic?: string | undefined): void {
        throw new Error("Method not implemented.");
    }
}