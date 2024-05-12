import type { DataKey, ROConsumer } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export const useDataKeyStore = defineStore('dataKey', () => {
    const dataKeyValues = ref<{ [pluginUuid: string]: Ref<{ [dataKey: string]: Ref<unknown> }> }>({});
    const dataKeysListeners = ref<{ [pluginUuid: string]: Ref<{ [dataKey: string]: Ref<Map<ROConsumer<unknown>, boolean>> }> }>({});
    const dataKeys = ref<{ [pluginUuid: string]: { [dataKey: string]: FrontendDataKey<unknown> } }>({});

    function setDataKeyValue(pluginUuid: string, dataKey: string, value: unknown) {
        if (!dataKeyValues.value[pluginUuid]) {
            dataKeyValues.value[pluginUuid] = ref({});
        }
        if (!dataKeyValues.value[pluginUuid].value[dataKey]) {
            dataKeyValues.value[pluginUuid].value[dataKey] = ref(value);
        } else {
            dataKeyValues.value[pluginUuid].value[dataKey].value = value;
        }
        const listeners = dataKeysListeners.value[pluginUuid]?.value[dataKey];
        if (listeners) {
            for (const [listener, listen] of listeners.value) {
                listener(value as Readonly<unknown>);
            }
        }
    }

    function addListener(pluginUuid: string, dataKey: string, handler: ROConsumer<unknown>) {
        if (!dataKeysListeners.value[pluginUuid]) {
            dataKeysListeners.value[pluginUuid] = ref({});
        }
        if (!dataKeysListeners.value[pluginUuid].value[dataKey]) {
            dataKeysListeners.value[pluginUuid].value[dataKey] = ref(new Map());
        }
        dataKeysListeners.value[pluginUuid].value[dataKey].value.set(handler, true);
    }

    function removeListener(pluginUuid: string, dataKey: string, handler: ROConsumer<unknown>) {
        if (dataKeysListeners.value[pluginUuid]?.value[dataKey]) {
            dataKeysListeners.value[pluginUuid].value[dataKey].value.delete(handler);
        }
    }

    class FrontendDataKey<T> implements DataKey<T> {

        constructor(public readonly pluginUuid: string, public readonly dataKey: string) { }

        get value(): Readonly<T> | undefined {
            return dataKeyValues.value[this.pluginUuid]?.value[this.dataKey]?.value as Readonly<T>;
        }

        set(newValue: T): void {
            setDataKeyValue(this.pluginUuid, this.dataKey, newValue);
        }

        on(handler: ROConsumer<T>): void {
            addListener(this.pluginUuid, this.dataKey, handler as ROConsumer<unknown>);
        }
        off(handler: ROConsumer<T>): void {
            removeListener(this.pluginUuid, this.dataKey, handler as ROConsumer<unknown>);
        }

    }

    function dataKeyFor<T>(pluginUuid: string, dataKey: string): FrontendDataKey<T> {
        if (!dataKeys.value[pluginUuid]) {
            dataKeys.value[pluginUuid] = {};
        }
        if (!dataKeys.value[pluginUuid][dataKey]) {
            dataKeys.value[pluginUuid][dataKey] = new FrontendDataKey(pluginUuid, dataKey);
        }
        return dataKeys.value[pluginUuid][dataKey] as FrontendDataKey<T>;
    }

    return { dataKeyValues, dataKeysListeners, setDataKeyValue, addListener, removeListener, dataKeyFor };
});