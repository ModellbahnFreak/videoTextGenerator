<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type AsyncComponentLoader } from 'vue';
import GraphicOptions from "./GraphicOptions.vue"
import { useComponentStore } from '@/code/pluginManagement/componentStore';
import { loadAllGraphicsComponents } from "@/code/pluginManagement/PluginManager";
import { useClientConfigStore } from '@/code/backend/clientConfigStore';
import GraphicComponentContainer from "./GraphicComponentContainer.vue";

const componentStore = useComponentStore();
const components = loadAllGraphicsComponents();

const clientConfigStore = useClientConfigStore();

document.documentElement.style.overflow = "hidden";

</script>

<template>
    <v-app theme="light" class="graphicsApp" :style="{
        animationName: clientConfigStore.config.identify ? 'identifyBg' : undefined
    }">
        <div class="graphicContainer" v-for="(pluginData, i) in componentStore.graphics.filter(p => p.isOpened)"
            :key="i">
            <GraphicComponentContainer :component="components[pluginData.pluginUuid][pluginData.indexInPlugin]"
                :metadata="pluginData">
            </GraphicComponentContainer>
        </div>
        <GraphicOptions :client-config="clientConfigStore.config"
            @config-changed="clientConfigStore.storeAndSendConfig" />
    </v-app>
</template>

<style>
html:has(.graphicsApp),
body:has(.graphicsApp),
#app:has(.graphicsApp),
.graphicsApp {
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
    background: none !important;
}
</style>