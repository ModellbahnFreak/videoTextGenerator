import Vue from "vue";
import App from "./App.vue";
import router from "./plugins/router";
import store from "./plugins/vuex";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";

Vue.config.productionTip = false;

const socket = io();

export const vue = new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
}).$mount("#app");
