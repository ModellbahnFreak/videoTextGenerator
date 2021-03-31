import { vue } from "@/main";
import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: window.location.pathname.startsWith("/edit"),
        themes: {
            dark: {
                secondary: "#aaa",
            },
        },
    },
});
