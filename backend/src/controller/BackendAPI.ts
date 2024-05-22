import type { APIBase, DataKey as IDataKey } from "@videotextgenerator/api"
import { BackendDataKey } from "./BackendDataKey.js";

export class BackendAPI implements APIBase {


    constructor(protected readonly pluginUuid: string) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<IDataKey<T>> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return BackendDataKey.for<T>(topic ?? this.pluginUuid, keyName);
    }

}