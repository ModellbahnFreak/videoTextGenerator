import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        textData: {} as object,
        socket: undefined as WebSocket | undefined,
    },
    mutations: {
        updateKey(state, payload: { key: string; value: string }) {
            console.log("Setting");
            Vue.set(state.textData, payload.key, payload.value);
        },
        deleteKey(state, key: string) {
            Vue.delete(state.textData, key);
        },
    },
    actions: {},
    modules: {},
});
