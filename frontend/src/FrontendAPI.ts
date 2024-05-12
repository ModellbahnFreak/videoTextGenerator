import type { APIBase, DataKey } from "@videotextgenerator/api";
import type { useDataKeyStore } from "./vuePlugins/stores/dataKey";

export class FrontendAPI implements APIBase {
    constructor(protected readonly pluginUuid: string, protected readonly dataKeyStore: ReturnType<typeof useDataKeyStore>) {

    }

    async getDataKey<T>(keyName: string, pluginUuid?: string | undefined): Promise<DataKey<T>> {
        console.log("API called", keyName, pluginUuid ?? this.pluginUuid);
        return this.dataKeyStore.dataKeyFor<T>(pluginUuid ?? this.pluginUuid, keyName);
    }
}