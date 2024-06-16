import type { SocketsManager } from "@/backend/SocketsManager";
import type { FrontendClientConfig, WebsocketClientConfigMessage } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useClientConfigStore = defineStore('clientConfig', () => {
    const config = ref<FrontendClientConfig>({});
    const uuid = ref("");
    const token = ref("");
    const useLocalStorage = ref(true);

    function storeConfig() {
        if (useLocalStorage.value) {
            localStorage.setItem("videotextgenerator", JSON.stringify({
                config: config.value,
                uuid: uuid.value,
                token: token.value
            }));
        }
    }
    function storeAndSendConfig() {
        storeConfig();
        const clientCfgMsg: WebsocketClientConfigMessage = {
            type: "clientConfig",
            uuid: uuid.value,
            serverUuid: "",
            config: config.value
        };
        socketsManager.value?.send(clientCfgMsg);
    }

    function loadConfig() {
        if (useLocalStorage.value) {
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
    }

    function receivedConfig(msg: WebsocketClientConfigMessage) {
        if (uuid.value != "" && uuid.value != msg.uuid) {
            console.warn(`Changing from client ${uuid.value} to ${msg.uuid}`)
        }
        console.log("Logged in as " + msg.uuid);
        if (msg.token) {
            token.value = msg.token;
        } else if (token.value == uuid.value || token.value.length == 0) {
            token.value = msg.uuid;
        }
        uuid.value = msg.uuid;
        if (msg.config && msg.config !== null) {
            config.value = msg.config;
        }
        storeConfig();
    }

    function getConfigKeyOrInitialize<T = FrontendClientConfig[keyof FrontendClientConfig]>(key: keyof FrontendClientConfig, defaultValue?: T): T {
        if (!config.value[key] && defaultValue) {
            config.value[key] = defaultValue as unknown as any;
        }
        return config.value[key] as T;
    }

    function setToken(newToken?: string | null) {
        token.value = newToken ?? token.value;
        storeConfig();
    }

    function setUseLocalStorage(save: boolean) {
        useLocalStorage.value = save;
    }

    const socketsManager = ref<SocketsManager | undefined>();
    function setSocketsManager(manager: SocketsManager) {
        socketsManager.value = manager;
    }

    loadConfig();
    return {
        config, uuid, token, receivedConfig, getConfigKeyOrInitialize, storeAndSendConfig,
        setToken, setUseLocalStorage,
        setSocketsManager
    };
});