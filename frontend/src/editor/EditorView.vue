<script setup lang="ts">
import '@mdi/font/css/materialdesignicons.css' // If icons are required in the graphic views, comment out this line and uncomment the equivalent line in @/vuePlugins/vuetify.ts
import { ref } from 'vue';
import { defineAsyncComponent, type AsyncComponentLoader } from 'vue';
import type { SocketsManager } from "@/backend/SocketsManager";
import { computed } from 'vue';
import { useComponentStore } from "@/vuePlugins/stores/component"
import { loadAllEditorComponents } from '@/PluginManager';
import { inject } from 'vue';
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';
import type { ComponentMetadata } from '@videotextgenerator/api';
import EditorOptions from "./EditorOptions.vue";

const componentStore = useComponentStore();
const components = loadAllEditorComponents();

const clientConfigStore = useClientConfigStore();

let panelToOpen = ref(-1);

const isConnected = ref(true);
const socketsManager = inject("socketsManager") as SocketsManager;
setInterval(() => {
    isConnected.value = socketsManager.numOpenSockets > 0;
}, 1000);

function openSlectedPlugin() {
    if (panelToOpen.value == -1) {
        componentStore.editors.forEach((_, i) => componentStore.editorSetOpened(i, true));
        return;
    }
    componentStore.editorSetOpened(panelToOpen.value, true);
    panelToOpen.value = -1;
}

function getComponentName(componentData: ComponentMetadata) {
    return componentData.title ?? (componentData.pluginUuid + "/e" + componentData.indexInPlugin)
}

const editorUnopenedAsItems = computed(() => {
    return componentStore.editors.map((c, i) => ({ value: i, title: getComponentName(c), isOpened: c.isOpened })).filter(c => !c.isOpened).concat([{ value: -1, title: "--All--", isOpened: false }]);
});

</script>

<template>
    <v-app>
        <v-main class="pa-2">
            <h1>Editor<span v-if="!isConnected"> - NOT CONNECTED!</span><span v-if="clientConfigStore.config.identify"
                    class="identify"> - IDENTIFYING!</span></h1>
            <v-row>
                <v-col sm="3" class="pr-0">
                    <v-autocomplete label="Panel" density="compact" v-model="panelToOpen" :items="editorUnopenedAsItems"
                        :hide-details="true"></v-autocomplete>
                </v-col>
                <v-col cols="auto">
                    <v-btn variant="text" color="success" @click="openSlectedPlugin">Open</v-btn>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <EditorOptions client-config="clientConfiStore.config" @config-changed="clientConfigStore.storeAndSendConfig" />
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-card v-for="(componentData, i) in componentStore.editors" :key="i" v-show="componentData.isOpened"
                class="ma-2">
                <v-card-title class="d-flex">
                    <div class="flex-0-0">
                        {{ getComponentName(componentData) }}
                    </div>
                    <v-spacer />
                    <div class="flex-0-0">
                        <v-btn icon="mdi-close" variant="text" size="small" color="error"
                            @click="() => componentStore.editorSetOpened(i, false)"></v-btn>
                    </div>
                </v-card-title>
                <component :is="components[componentData.pluginUuid][componentData.indexInPlugin]">
                </component>
            </v-card>
        </v-main>
    </v-app>
</template>

<style>
@keyframes identifyCol {
    0% {
        color: red;
    }

    49% {
        color: red;
    }

    50% {
        color: yellow;
    }

    100% {
        color: yellow;
    }
}

.identify {
    animation-name: identifyCol;
    animation-duration: 1s;
    animation-iteration-count: infinite;
}
</style>