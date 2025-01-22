import { DataKey, ROConsumer } from "./DataKey";

export interface APIBase {
    getDataKey<T>(keyName: string, topic?: string, defaultValue?: T): Promise<DataKey<T> | null>;
    on<T>(event: string, listener: ROConsumer<T>, topic?: string): void;
    off<T>(event: string, listener: ROConsumer<T>, topic?: string): void;
    raise<T>(event: string, payload: T, topic?: string): void;
    knownTopics(): Promise<string[]>;
    knownDataKeys(topic: string): Promise<string[]>;
}