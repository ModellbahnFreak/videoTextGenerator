import { DataKey } from "./DataKey";

export interface APIBase {
    getDataKey<T>(keyName: string, pluginUuid?: string): Promise<DataKey<T | unknown>>;
}