import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './vuePlugins/router'
import vuetify from "./vuePlugins/vuetify"
import { loadPlugins } from './PluginManager'
import './SocketToBackend'

const app = createApp(App)
const pinia = createPinia();

app.use(pinia)
app.use(router)
app.use(vuetify);

loadPlugins().then(() => {
    app.mount('#app');
});

