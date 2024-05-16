import type { APIBase, DataKey } from "@videotextgenerator/api"
import { BackendDataKey } from "./BackendDataKey.js";

export class BackendAPI implements APIBase {
    constructor(protected readonly pluginUuid: string) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<DataKey<T>> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return new BackendDataKey<T>();
    }

}