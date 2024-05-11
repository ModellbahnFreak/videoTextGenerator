import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './vuePlugins/router'
import vuetify from "./vuePlugins/vuetify"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify);

app.mount('#app')
