import type { APIBase, DataKey } from "@videotextgenerator/api";
import type { useDataKeyStore } from "./vuePlugins/stores/dataKey";

export class FrontendAPI implements APIBase {
    constructor(protected readonly pluginUuid: string, protected readonly dataKeyStore: ReturnType<typeof useDataKeyStore>) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<DataKey<T>> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return this.dataKeyStore.dataKeyFor<T>(topic ?? this.pluginUuid, keyName);
    }
}