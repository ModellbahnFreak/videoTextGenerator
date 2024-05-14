import type { APIBase, DataKey } from "@videotextgenerator/api"
import { BackendDataKey } from "./BackendDataKey";

export class BackendAPI implements APIBase {
    constructor(protected readonly pluginUuid: string) {

    }

    async getDataKey<T>(keyName: string, pluginUuid?: string | undefined): Promise<DataKey<T>> {
        console.log("API called", keyName, pluginUuid ?? this.pluginUuid);
        return new BackendDataKey<T>();
    }

}