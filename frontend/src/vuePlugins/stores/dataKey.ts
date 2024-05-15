import { SOCKET_INSTANCE } from "@/SocketToBackend";
import type { DataKey, ROConsumer } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";


export const useDataKeyStore = defineStore('dataKey', () => {
    const dataKeyValues = ref<{ [topic: string]: Ref<{ [dataKey: string]: Ref<unknown> }> }>({});
    const dataKeysListeners = ref<{ [topic: string]: Ref<{ [dataKey: string]: Ref<Map<ROConsumer<unknown>, boolean>> }> }>({});
    const dataKeys = ref<{ [topic: string]: { [dataKey: string]: FrontendDataKey<unknown> } }>({});

    function setDataKeyValue(topic: string, dataKey: string, value: unknown, sendToServer: boolean = true) {
        if (sendToServer) {
            SOCKET_INSTANCE.dataKey(topic, dataKey, value);
        }
        if (!dataKeyValues.value[topic]) {
            dataKeyValues.value[topic] = ref({});
        }
        if (!dataKeyValues.value[topic].value[dataKey]) {
            dataKeyValues.value[topic].value[dataKey] = ref(value);
        } else {
            dataKeyValues.value[topic].value[dataKey].value = value;
        }
        const listeners = dataKeysListeners.value[topic]?.value[dataKey];
        if (listeners) {
            for (const [listener, listen] of listeners.value) {
                listener(value as Readonly<unknown>);
            }
        }
    }

    function addListener(topic: string, dataKey: string, handler: ROConsumer<unknown>) {
        if (!dataKeysListeners.value[topic]) {
            dataKeysListeners.value[topic] = ref({});
        }
        if (!dataKeysListeners.value[topic].value[dataKey]) {
            dataKeysListeners.value[topic].value[dataKey] = ref(new Map());
        }
        dataKeysListeners.value[topic].value[dataKey].value.set(handler, true);
    }

    function removeListener(topic: string, dataKey: string, handler: ROConsumer<unknown>) {
        if (dataKeysListeners.value[topic]?.value[dataKey]) {
            dataKeysListeners.value[topic].value[dataKey].value.delete(handler);
        }
    }

    class FrontendDataKey<T> implements DataKey<T> {

        constructor(public readonly topic: string, public readonly dataKey: string) { }

        get value(): Readonly<T> | undefined {
            return dataKeyValues.value[this.topic]?.value[this.dataKey]?.value as Readonly<T>;
        }

        set(newValue: T): void {
            setDataKeyValue(this.topic, this.dataKey, newValue);
        }

        on(handler: ROConsumer<T>): void {
            addListener(this.topic, this.dataKey, handler as ROConsumer<unknown>);
        }
        off(handler: ROConsumer<T>): void {
            removeListener(this.topic, this.dataKey, handler as ROConsumer<unknown>);
        }

    }

    async function dataKeyFor<T>(topic: string, dataKey: string): Promise<FrontendDataKey<T>> {
        if (!dataKeys.value[topic]) {
            dataKeys.value[topic] = {};
        }
        if (!dataKeys.value[topic][dataKey]) {
            dataKeys.value[topic][dataKey] = new FrontendDataKey(topic, dataKey);
            const value = await SOCKET_INSTANCE.dataKeyRequest(topic, dataKey);
            setDataKeyValue(topic, dataKey, value, false);
        }
        return dataKeys.value[topic][dataKey] as FrontendDataKey<T>;
    }

    return { dataKeyValues, dataKeysListeners, setDataKeyValue, addListener, removeListener, dataKeyFor };
});