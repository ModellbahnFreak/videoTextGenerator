import { DataKey } from "./DataKey";

export interface APIBase {
    getDataKey<T>(keyName: string, topic?: string): Promise<DataKey<T | unknown>>;
}