<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import GraphicOptions from "./GraphicOptions.vue"
import { useComponentStore } from '@/vuePlugins/stores/component';
import { usePluginStore } from '@/vuePlugins/stores/plugin';
import { loadAllGraphicsComponents } from "@/PluginManager";
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';

const componentStore = useComponentStore();
const components = loadAllGraphicsComponents();

const clientConfigStore = useClientConfigStore();

</script>

<template>
    <v-app theme="light" class="graphicsApp" :style="{
        animationName: clientConfigStore.config.identify ? 'identifyBg' : undefined
    }">
        <div class="graphicContainer" v-for="(pluginData, i) in componentStore.graphics.filter(p => p.isOpened)"
            :key="i">
            <component :is="components[pluginData.pluginUuid][pluginData.indexInPlugin]"></component>
        </div>
        <GraphicOptions />
    </v-app>
</template>

<style>
html:has(.graphicContainer) {
    overflow: hidden !important;
}

.graphicContainer {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
}

@keyframes identifyBg {
    0% {
        background-color: black;
    }

    49% {
        background-color: black;
    }

    50% {
        background-color: yellow;
    }

    100% {
        background-color: yellow;
    }
}

.graphicsApp {
    animation-duration: 1s;
    animation-iteration-count: infinite;
}
</style>