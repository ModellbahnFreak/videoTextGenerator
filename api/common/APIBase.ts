import { DataKey } from "./DataKey";

export interface APIBase {
    getDataKey<T>(keyName: string, topic?: string): Promise<DataKey<T | unknown>>;
    on<T>(event: string, listener: (payload: T) => void, topic?: string): void;
    off<T>(event: string, listener: (payload: T) => void, topic?: string): void;
}