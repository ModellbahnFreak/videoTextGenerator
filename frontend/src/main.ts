import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './vuePlugins/router'
import vuetify from "./vuePlugins/vuetify"
import { loadPlugins } from './PluginManager'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify);

loadPlugins().then(() => {
    app.mount('#app');
});

