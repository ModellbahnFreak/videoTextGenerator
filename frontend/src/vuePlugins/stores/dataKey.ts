import type { SocketsManager } from "@/backend/SocketsManager";
import type { DataKey, DataKeyListener, ROConsumer, WebsocketSubscribeMessage } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { computed, ref, shallowRef, type Ref, type WritableComputedRef } from "vue";



interface FrontendDataKey<T> extends Ref<T> {
    set value(newValue: T);

    setInternal(newValue: T, publishToServer?: boolean): void;

    set(newValue: T): Promise<void>;

    on(handler: ROConsumer<T>): void;

    off(handler: ROConsumer<T>): void;

    getKey(): string;

    getTopic(): string;
}

export const useDataKeyStore = defineStore('dataKey', () => {

    //const dataKeyValues = ref<{ [topic: string]: { [dataKey: string]: Ref<unknown> } }>({});
    const dataKeysListeners = ref<{ [topic: string]: { [dataKey: string]: Map<ROConsumer<unknown>, boolean> } }>({});
    const dataKeys: { [topic: string]: { [dataKey: string]: FrontendDataKey<unknown> } } = {};
    const dataKeyVersions: { [topic: string]: { [dataKey: string]: { version: number, subversion: number } } } = {};

    const socketsManager = ref<SocketsManager | undefined>();

    function publishDataKeyUpdate(topic: string, dataKey: string, value: unknown, sendToServer: boolean = true) {
        console.log("Publishing new data key", topic, dataKey, value, sendToServer);
        if (sendToServer) {
            socketsManager.value?.dataKey(topic, dataKey, value, getNextDataKeyVersion(topic, dataKey), 0);
        }
        const listeners = (dataKeysListeners.value[topic] ?? {})[dataKey];
        if (listeners) {
            for (const [listener, listen] of listeners) {
                listener(value as Readonly<unknown>);
            }
        }
    }

    function setDataKeyValue(topic: string, dataKey: string, value: unknown) {
        console.log("Setting new data key", topic, dataKey, value);
        if (value === undefined) {
            value = null;
        }
        dataKeys[topic][dataKey].value = value;

        publishDataKeyUpdate(topic, dataKey, value);
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

    async function dataKeyFor<T>(topic: string, dataKey: string, requestValue: boolean = true): Promise<DataKey<T>> {
        // todo: check permission to get datakey
        if (!dataKeys[topic]) {
            Object.assign(dataKeys, { [topic]: {} });
        }
        if (!dataKeys[topic][dataKey]) {
            const valueRef = ref<unknown>(undefined);
            const comp: FrontendDataKey<unknown> = Object.assign(valueRef,
                {
                    valueDescriptor: Object.getOwnPropertyDescriptor(valueRef, "value"),
                    set value(newValue: T) {
                        this.set(newValue);
                    },
                    setInternal(newValue: T, publishToServer: boolean = false) {
                        if (this.valueDescriptor?.set) {
                            this.valueDescriptor.set(newValue);
                        } else {
                            valueRef.value = newValue;
                        }
                        publishDataKeyUpdate(topic, dataKey, newValue, publishToServer);
                    },
                    async set(newValue: T): Promise<void> {
                        this.setInternal(newValue, true);
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
            console.log("Added for", topic, dataKey, comp, dataKeys[topic][dataKey]);

        }
        if (requestValue && !socketsManager.value?.isSubscribedTo(topic)) {
            console.log("Requesting data key");
            socketsManager.value?.dataKeyRequest(topic, dataKey).then(value => {
                dataKeys[topic][dataKey].setInternal(value);
            });
        }
        return dataKeys[topic][dataKey] as DataKey<T>;
    }

    const onDataKeyFromServer: DataKeyListener = (topic, dataKey, value, version, subversion) => {
        if (isDataKeyVersionNew(topic, dataKey, version, subversion)) {
            dataKeyFor(topic, dataKey, false).then(() => {
                console.log("dataKeys", dataKeys, topic, dataKey, dataKeys[topic], dataKeys[topic][dataKey]);
                dataKeys[topic][dataKey].setInternal(value);
            })
        }
    }

    function getNextDataKeyVersion(topic: string, dataKey: string): number {
        if (!dataKeyVersions[topic]) {
            dataKeyVersions[topic] = {};
        }
        if (!dataKeyVersions[topic][dataKey]) {
            dataKeyVersions[topic][dataKey] = { version: -1, subversion: -1 };
        }
        dataKeyVersions[topic][dataKey].subversion = 0;
        return ++dataKeyVersions[topic][dataKey].version;
    }

    function isDataKeyVersionNew(topic: string, dataKey: string, version: number, subversion: number): boolean {
        if (!dataKeyVersions[topic]) {
            dataKeyVersions[topic] = {};
        }
        if (!dataKeyVersions[topic][dataKey]) {
            dataKeyVersions[topic][dataKey] = { version: -1, subversion: -1 };
            return true;
        }
        const oldVersion = dataKeyVersions[topic][dataKey];
        const isNew = oldVersion === undefined ||
            oldVersion.version < version ||
            (oldVersion.version > (4294967295 - 5) && version < 5) ||
            (oldVersion.version == version && oldVersion.subversion < subversion);
        if (!isNew) {
            console.log(`Recevied dataKey ${topic}/d-${dataKey}/${version}.${subversion} again. Not emitting.`);
        }

        dataKeyVersions[topic][dataKey].version = version;
        dataKeyVersions[topic][dataKey].subversion = subversion;
        return isNew;
    }

    async function getKnownDataKeys(topic: string): Promise<string[]> {
        socketsManager.value?.send({
            type: "subscribe",
            topics: [topic]
        } as WebsocketSubscribeMessage);
        return Object.keys(dataKeys[topic] || {});
    }

    async function getKnownTopics(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                resolve(Object.keys(dataKeys));
            }, 1000);
            socketsManager.value?.getKnownTopics().then(topics => {
                clearTimeout(timeout);
                for (const topic of topics) {
                    if (!dataKeys[topic]) {
                        Object.assign(dataKeys, { [topic]: {} });
                    }
                }
                resolve(Object.keys(dataKeys));
            });
        });
    }

    function setSocketsManager(manager: SocketsManager) {
        if (socketsManager.value) {
            socketsManager.value.off("dataKey", onDataKeyFromServer);
        }
        socketsManager.value = manager;
        socketsManager.value.on("dataKey", onDataKeyFromServer);
    }

    return {
        dataKeysListeners,
        publishDataKeyUpdate, addListener, removeListener, dataKeyFor,
        getKnownDataKeys, getKnownTopics,
        setSocketsManager
    };
});