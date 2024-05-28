import { DataKey, ROConsumer } from "./DataKey";

export interface APIBase {
    getDataKey<T>(keyName: string, topic?: string): Promise<DataKey<T | unknown> | null>;
    on<T>(event: string, listener: ROConsumer<T>, topic?: string): void;
    off<T>(event: string, listener: ROConsumer<T>, topic?: string): void;
}