import type { APIBase, DataKey as IDataKey } from "@videotextgenerator/api"
import { BackendDataKey } from "../data/BackendDataKey.js";
import { DataKeyManager } from "../data/DataKeyManager.js";

export class BackendAPI implements APIBase {

    constructor(
        protected readonly pluginUuid: string,
        protected readonly dataKeyManager: DataKeyManager,
    ) {

    }

    async getDataKey<T>(keyName: string, topic?: string | undefined): Promise<IDataKey<T> | null> {
        console.log("API called", keyName, topic ?? this.pluginUuid);
        return this.dataKeyManager.for<T>(topic ?? this.pluginUuid, keyName);
    }

    on<T>(event: string, listener: (payload: T) => void, topic?: string | undefined): void {
        throw new Error("Method not implemented.");
    }
    off<T>(event: string, listener: (payload: T) => void, topic?: string | undefined): void {
        throw new Error("Method not implemented.");
    }
}