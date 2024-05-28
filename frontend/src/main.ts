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

const socketsManager = new SocketsManager(useClientConfigStore(), useDataKeyStore());
const eventManager = new EventManager();
socketsManager.on("event", eventManager.raise.bind(eventManager));
app.use(socketsManager);

loadPlugins(eventManager).then(() => {
    app.mount('#app');
});

