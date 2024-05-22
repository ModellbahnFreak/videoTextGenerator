import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './vuePlugins/router'
import vuetify from "./vuePlugins/vuetify"
import { loadPlugins } from './PluginManager'
import './SocketToBackend'
import { SOCKET_INSTANCE } from './SocketToBackend'
import { useClientConfigStore } from './vuePlugins/stores/clientConfig'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia)
app.use(router)
app.use(vuetify);

SOCKET_INSTANCE.clientConfigStore = useClientConfigStore();

loadPlugins().then(() => {
    app.mount('#app');
});

