<script setup lang="ts">
import { defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import { useTheme } from 'vuetify';
import GraphicOptions from "./GraphicOptions.vue"

const plugins = Object.fromEntries(Object.entries({
    ...import.meta.glob("@/componentsGraphic/*.vue"),
    ...import.meta.glob("@plugins/*/frontend/graphic/*.vue"),
}).map(plugin => [plugin[0], defineAsyncComponent(plugin[1] as AsyncComponentLoader)]));

</script>

<template>
    <v-app theme="light">
        <div class="graphicContainer" v-for="(pluginGraphic, pluginName) in plugins" :key="pluginName">
            {{ pluginName }}
            <component :is="pluginGraphic"></component>
        </div>
        <GraphicOptions />
    </v-app>
</template>

<style>
html {
    overflow: hidden;
}

.graphicContainer {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vw;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
}
</style>
