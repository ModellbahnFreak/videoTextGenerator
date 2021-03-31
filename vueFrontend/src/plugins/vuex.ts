import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        textData: {} as { [key: string]: string },
        isActive: {} as { [key: string]: boolean },
        socket: undefined as WebSocket | undefined,
    },
    mutations: {
        updateKey(state, payload: { key: string; value: string }) {
            Vue.set(state.textData, payload.key, payload.value);
        },
        deleteKey(state, key: string) {
            Vue.delete(state.textData, key);
        },
        updateActive(state, payload: { key: string; active: boolean }) {
            Vue.set(state.isActive, payload.key, payload.active);
        },
        deleteActive(state, key: string) {
            Vue.delete(state.isActive, key);
        },
    },
    actions: {},
    modules: {},
});
