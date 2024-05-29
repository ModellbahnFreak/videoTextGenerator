import type { SocketsManager } from "@/backend/SocketsManager";
import type { DataKey, DataKeyListener, ROConsumer } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { computed, ref, type Ref, type WritableComputedRef } from "vue";

export const useDataKeyStore = defineStore('dataKey', () => {

    const dataKeyValues = ref<{ [topic: string]: { [dataKey: string]: unknown } }>({});
    const dataKeysListeners = ref<{ [topic: string]: { [dataKey: string]: Map<ROConsumer<unknown>, boolean> } }>({});
    const dataKeys: { [topic: string]: { [dataKey: string]: DataKey<unknown> } } = {};
    const dataKeyVersions: { [topic: string]: { [dataKey: string]: number } } = {};

    const socketsManager = ref<SocketsManager | undefined>();

    function setDataKeyValue(topic: string, dataKey: string, value: unknown, sendToServer: boolean = true) {
        if (sendToServer) {
            socketsManager.value?.dataKey(topic, dataKey, value, getNextDataKeyVersion(topic, dataKey));
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

    const test: WritableComputedRef<string> = computed({
        get: () => "a",
        set: (v: string) => { }
    });

    async function dataKeyFor<T>(topic: string, dataKey: string): Promise<DataKey<T>> {
        // todo: check permission to get datakey
        if (!dataKeys[topic]) {
            Object.assign(dataKeys, { [topic]: {} });
        }
        if (!dataKeys[topic][dataKey]) {
            const comp: DataKey<unknown> = Object.assign(computed({
                get: () => (dataKeyValues.value[topic] ?? {})[dataKey] as Readonly<T>,
                set: (newValue: T) => setDataKeyValue(topic, dataKey, newValue),
            }),
                {
                    async set(newValue: T): Promise<void> {
                        setDataKeyValue(topic, dataKey, newValue);
                    },

                    on(handler: ROConsumer<T>): void {
                        addListener(topic, dataKey, handler as ROConsumer<unknown>);
                    },

                    off(handler: ROConsumer<T>): void {
                        removeListener(topic, dataKey, handler as ROConsumer<unknown>);
                    },
                    getKey(): string {
                        return dataKey;
                    },
                    getTopic(): string {
                        return topic;
                    }
                });
            Object.assign(dataKeys[topic], { [dataKey]: comp });

            socketsManager.value?.dataKeyRequest(topic, dataKey).then(value => {
                setDataKeyValue(topic, dataKey, value, false);
            });
        }
        return dataKeys[topic][dataKey] as DataKey<T>;
    }


    function getNextDataKeyVersion(topic: string, dataKey: string): number {
        if (!dataKeyVersions[topic]) {
            dataKeyVersions[topic] = {};
        }
        if (!dataKeyVersions[topic][dataKey]) {
            dataKeyVersions[topic][dataKey] = 0;
        }
        return ++dataKeyVersions[topic][dataKey];
    }

    function isDataKeyVersionNew(topic: string, dataKey: string, version: number): boolean {
        if (!dataKeyVersions[topic]) {
            dataKeyVersions[topic] = {};
        }
        const oldVersion = dataKeyVersions[topic][dataKey];
        dataKeyVersions[topic][dataKey] = version;
        const isNew = oldVersion === undefined ||
            oldVersion < version ||
            (oldVersion > (4294967295 - 5) && version < 5);
        if (!isNew) {
            console.log(`Recevied dataKey ${topic}/d-${dataKey}/${version} again. Not emitting.`);
        }
        return isNew;
    }

    const onDataKeyFromServer: DataKeyListener = (topic, dataKey, value, version) => {
        if (isDataKeyVersionNew(topic, dataKey, version)) {
            setDataKeyValue(topic, dataKey, value, false);
        }
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