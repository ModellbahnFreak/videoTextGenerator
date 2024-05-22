import type { WebsocketClientConfigMessage } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useClientConfigStore = defineStore('clientConfig', () => {
    const config = ref({});
    const uuid = ref("");
    const token = ref("");

    function storeConfig() {
        localStorage.setItem("videotextgenerator", JSON.stringify({
            config: config.value,
            uuid: uuid.value,
            token: token.value
        }));
    }

    function loadConfig() {
        const loaded = JSON.parse(localStorage.getItem("videotextgenerator") ?? "{}");
        if (typeof loaded?.config === "object") {
            config.value = loaded.config;
        }
        if (typeof loaded?.uuid === "string") {
            uuid.value = loaded.uuid;
        }
        if (typeof loaded?.token === "string") {
            token.value = loaded.token;
        }
    }

    function receivedConfig(msg: WebsocketClientConfigMessage) {
        if (uuid.value != "" && uuid.value != msg.uuid) {
            console.warn(`Changing from client ${uuid.value} to ${msg.uuid}`)
        }
        if (token.value == uuid.value || token.value.length == 0) {
            token.value = msg.uuid;
        }
        uuid.value = msg.uuid;
        config.value = msg.config;
        storeConfig();
    }

    loadConfig();
    return { config, uuid, token, receivedConfig };
});