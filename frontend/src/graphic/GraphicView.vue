<script setup lang="ts">
import { defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import GraphicOptions from "./GraphicOptions.vue"
import { useComponentStore } from '@/vuePlugins/stores/component';
import { usePluginStore } from '@/vuePlugins/stores/plugin';
import { loadAllGraphicsComponents } from "@/PluginManager";

const componentStore = useComponentStore();
const components = loadAllGraphicsComponents();

</script>

<template>
    <v-app theme="light">
        <div class="graphicContainer" v-for="(pluginData, i) in componentStore.graphics.filter(p => p.isOpened)"
            :key="i">
            <component :is="components[pluginData.pluginUuid][pluginData.indexInPlugin]"></component>
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
@/vuePlugins/stores/component