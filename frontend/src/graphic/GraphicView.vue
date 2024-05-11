<script setup lang="ts">
import { defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import GraphicOptions from "./GraphicOptions.vue"
import { useClientStore } from '@/vuePlugins/stores/client';

const plugins = Object.fromEntries(Object.entries({
    ...import.meta.glob("@/componentsGraphic/*.vue"),
    ...import.meta.glob("@plugins/*/frontend/graphic/*.vue"),
}).map(plugin => [plugin[0], defineAsyncComponent(plugin[1] as AsyncComponentLoader)]));

const clientStore = useClientStore();
Object.keys(plugins).forEach(clientStore.graphicsAdd);

</script>

<template>
    <v-app theme="light">
        <div class="graphicContainer" v-for="(pluginData, i) in clientStore.graphics.filter(p => p.isOpened)" :key="i">
            <component :is="plugins[pluginData.path]"></component>
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
