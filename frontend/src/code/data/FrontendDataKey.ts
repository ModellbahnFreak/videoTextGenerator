import type { DataKey, ROConsumer } from "@videotextgenerator/api";
import type { useDataKeyStore } from "./dataKeyStore";
import { customRef, reactive, watch, type WatchStopHandle } from "vue";

export class FrontendDataKey<T> /* Class does not implement DataKey<T>, needs to be mixed into ref using create*/ {
    static create<U>(
        topic: string,
        dataKey: string,
        dataKeyStore: ReturnType<typeof useDataKeyStore>): DataKey<U> {
        const createdDataKey = new FrontendDataKey<U>(topic, dataKey, dataKeyStore);
        const dataKeyRef = customRef<U>((track, trigger) => {
            createdDataKey.track = track;
            createdDataKey.trigger = trigger;
            return createdDataKey;
        });
        if (!("value" in createdDataKey)) {
            const refPrototype = Object.getPrototypeOf(dataKeyRef);
            Object.assign(FrontendDataKey.prototype, refPrototype);
            const props = Object.getOwnPropertyDescriptors(refPrototype);
            delete props["constructor"];
            Object.defineProperties(FrontendDataKey.prototype, props);
        }
        return Object.assign(createdDataKey, dataKeyRef);
    }

    private track: () => void = () => { };
    private trigger: () => void = () => { };
    private stopWatcher: WatchStopHandle | null = null;

    private constructor(
        private readonly topic: string,
        private readonly dataKey: string,
        private readonly dataKeyStore: ReturnType<typeof useDataKeyStore>,
    ) { }

    private updateWatcher(newValue: T) {
        if (this.stopWatcher) {
            this.stopWatcher();
            this.stopWatcher = null;
        }
        if (typeof newValue == "object" && newValue !== null) {
            const reactiveVal = reactive(newValue);
            this.stopWatcher = watch(reactiveVal, (val, oldVal) => {
                this.set(val as T);
            }, { deep: true });
            return reactiveVal;
        }
        return null;
    }

    async set(newValue: T): Promise<void> {
        console.log(`${Date.now()}: Data key ${this.dataKey} was set`);
        const reactiveVal = this.updateWatcher(newValue);
        if (reactiveVal) {
            await this.dataKeyStore.setDataKeyValue(this.topic, this.dataKey, reactiveVal);
        } else {
            await this.dataKeyStore.setDataKeyValue(this.topic, this.dataKey, newValue);
        }
        this.trigger();
    }
    setInternal(newValue: T) {
        const reactiveVal = this.updateWatcher(newValue);
        this.trigger();
        return reactiveVal;
    }

    get(): T {
        this.track();
        return (this.dataKeyStore.dataKeyValues[this.topic] ?? {})[this.dataKey] as T;
    }

    on(handler: ROConsumer<T>): void {
        this.dataKeyStore.addListener(this.topic, this.dataKey, handler as ROConsumer<unknown>);
    }

    off(handler: ROConsumer<T>): void {
        this.dataKeyStore.removeListener(this.topic, this.dataKey, handler as ROConsumer<unknown>);
    }

    getKey(): string {
        return this.dataKey;
    }

    getTopic(): string {
        return this.topic;
    }
}