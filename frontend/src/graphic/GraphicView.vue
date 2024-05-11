<script setup lang="ts">
import { defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import GraphicOptions from "./GraphicOptions.vue"
import { useComponentStore } from '@/vuePlugins/stores/component';
import { usePluginStore } from '@/vuePlugins/stores/plugin';

const pluginStore = usePluginStore();
const componentStore = useComponentStore();

const components = Object.fromEntries(Object.entries(pluginStore.pluginsByUuid).map(p =>
    [p[0], p[1].plugin.getGraphicComponents().map((component, i) => {
        componentStore.graphicsAdd(p[0], i, component.title);
        return typeof component.component == "function"
            ? defineAsyncComponent(component.component as AsyncComponentLoader)
            : defineAsyncComponent((() => Promise.resolve(component.component)) as AsyncComponentLoader)
    })]
));

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