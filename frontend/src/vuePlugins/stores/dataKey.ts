import type { DataKeyListener, SocketsManager } from "@/backend/SocketsManager";
import type { DataKey, ROConsumer } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";


export const useDataKeyStore = defineStore('dataKey', () => {
    const dataKeyValues = ref<{ [topic: string]: { [dataKey: string]: unknown } }>({});
    const dataKeysListeners = ref<{ [topic: string]: { [dataKey: string]: Map<ROConsumer<unknown>, boolean> } }>({});
    const dataKeys = ref<{ [topic: string]: { [dataKey: string]: FrontendDataKey<unknown> } }>({});

    const socketsManager = ref<SocketsManager | undefined>();

    function setDataKeyValue(topic: string, dataKey: string, value: unknown, sendToServer: boolean = true) {
        if (sendToServer) {
            socketsManager.value?.dataKey(topic, dataKey, value);
        }
        if (!dataKeyValues.value[topic]) {
            dataKeyValues.value[topic] = {};
        }
        dataKeyValues.value[topic][dataKey] = value;

        const listeners = (dataKeysListeners.value[topic] ?? {})[dataKey];
        if (listeners) {
            for (const [listener, listen] of listeners) {
                listener(value as Readonly<unknown>);
            }
        }
    }

    function addListener(topic: string, dataKey: string, handler: ROConsumer<unknown>) {
        if (!dataKeysListeners.value[topic]) {
            dataKeysListeners.value[topic] = {};
        }
        if (!dataKeysListeners.value[topic][dataKey]) {
            dataKeysListeners.value[topic][dataKey] = new Map();
        }
        dataKeysListeners.value[topic][dataKey].set(handler, true);
    }

    function removeListener(topic: string, dataKey: string, handler: ROConsumer<unknown>) {
        if ((dataKeysListeners.value[topic] ?? {})[dataKey]) {
            dataKeysListeners.value[topic][dataKey].delete(handler);
        }
    }

    class FrontendDataKey<T> implements DataKey<T> {

        constructor(public readonly topic: string, public readonly dataKey: string) { }

        get value(): Readonly<T> | undefined {
            return (dataKeyValues.value[this.topic] ?? {})[this.dataKey] as Readonly<T>;
        }

        async set(newValue: T): Promise<void> {
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
            socketsManager.value?.dataKeyRequest(topic, dataKey).then(() => {
                setDataKeyValue(topic, dataKey, undefined, false);
            });
        }
        return dataKeys.value[topic][dataKey] as FrontendDataKey<T>;
    }

    const onDataKeyFromServer: DataKeyListener = (topic, dataKey, value) => {
        setDataKeyValue(topic, dataKey, value, false);
    }
    function setSocketsManager(manager: SocketsManager) {
        if (socketsManager.value) {
            socketsManager.value.off("dataKey", onDataKeyFromServer);
        }
        socketsManager.value = manager;
        socketsManager.value.on("dataKey", onDataKeyFromServer);
    }

    return {
        dataKeyValues, dataKeysListeners,
        setDataKeyValue, addListener, removeListener, dataKeyFor,
        setSocketsManager
    };
});