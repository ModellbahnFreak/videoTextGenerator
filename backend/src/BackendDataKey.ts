import { DataKey, ROConsumer } from "@videotextgenerator/api";

export class BackendDataKey<T> implements DataKey<T> {
    value: Readonly<T> | undefined;
    set(newValue: T): void {
        throw new Error("Method not implemented.");
    }
    on(handler: ROConsumer<T>): void {
        throw new Error("Method not implemented.");
    }
    off(handler: ROConsumer<T>): void {
        throw new Error("Method not implemented.");
    }

}