import Vue from "vue";
import App from "./App.vue";
import router from "./plugins/router";
import store from "./plugins/vuex";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import { io, Socket } from "socket.io-client";

Vue.config.productionTip = false;

const socket = io(process.env.VUE_APP_WS_URL);

declare module "vue/types/vue" {
    export interface Vue {
        $socket: Socket;
    }
}
Vue.prototype.$socket = socket;

export const vue = new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
});

vue.$mount("#app");
