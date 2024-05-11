import { defineStore } from "pinia";
import { ref } from "vue";

export const useDataKeyStore = defineStore('dataKey', () => {
    const keys = ref<{ [pluginUuid: string] }>({})
});