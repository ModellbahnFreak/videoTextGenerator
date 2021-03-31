<template>
    <v-app>
        <v-main>
            <v-btn
                @click="
                    $store.commit('updateKey', {
                        key: 'lowerThird',
                        value: 'This is a test',
                    })
                "
            >
                Click me
            </v-btn>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
    name: "App",
})
export default class App extends Vue {
    constructor() {
        super();
        const sock = io.connect();
    }
}
</script>
