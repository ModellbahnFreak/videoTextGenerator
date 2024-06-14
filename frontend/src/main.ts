import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './vuePlugins/router'
import vuetify from "./vuePlugins/vuetify"
import { loadPlugins } from './PluginManager'
import { useClientConfigStore } from './vuePlugins/stores/clientConfig'
import { SocketsManager } from './backend/SocketsManager'
import { useDataKeyStore } from './vuePlugins/stores/dataKey'
import { EventManager } from './backend/EventManager'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia)
app.use(router)
app.use(vuetify);

const clientConfigStore = useClientConfigStore();

const locationUrl = new URL(window.location.toString());
if (locationUrl.searchParams.has("token")) {
    clientConfigStore.setToken(locationUrl.searchParams.get("token"));
    console.log("Found token. Removing and redirecting", clientConfigStore.token);
    locationUrl.searchParams.delete("token");
    window.location.replace(locationUrl);
}
if (locationUrl.searchParams.has("tempToken")) {
    clientConfigStore.setUseLocalStorage(false);
    clientConfigStore.setToken(locationUrl.searchParams.get("tempToken"));
    console.log("Found non local storage token.", clientConfigStore.token);
}

const socketsManager = new SocketsManager(clientConfigStore, useDataKeyStore());
const eventManager = new EventManager();

// Connect event manager and sockets manager. Only send an event back to the servers if it is not the event we are currently receiving (reduce message spam)
let currEventUuid: string | undefined;
socketsManager.on("event", (topic, event, payload, uuid) => {
    currEventUuid = uuid;
    eventManager.raise(topic, event, payload, uuid);
});
eventManager.on((topic, event, payload, uuid) => {
    if (uuid != currEventUuid) {
        socketsManager.event(topic, event, payload, uuid);
    }
});

app.use(socketsManager);

loadPlugins(eventManager).then(() => {
    app.mount('#app');
});

