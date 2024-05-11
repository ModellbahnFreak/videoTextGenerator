<script setup lang="ts">
import { ref } from 'vue';
import { defineAsyncComponent, type AsyncComponentLoader } from 'vue';
import type { PluginData } from "@videotextgenerator/api";
import { computed } from 'vue';
import { useClientStore } from "@/vuePlugins/stores/client"

const plugins = Object.fromEntries(Object.entries({
    ...import.meta.glob("@/componentsEditor/*.vue"),
    ...import.meta.glob("@plugins/*/frontend/editor/*.vue"),
}).map(plugin => [plugin[0], defineAsyncComponent(plugin[1] as AsyncComponentLoader)]));

const clientStore = useClientStore();
Object.keys(plugins).forEach(clientStore.editorAdd);

let panelToOpen = ref(-1);

function openSlectedPlugin() {
    if (panelToOpen.value == -1) {
        clientStore.editors.forEach((_, i) => clientStore.editorSetOpened(i, true));
        return;
    }
    clientStore.editorSetOpened(panelToOpen.value, true);
    panelToOpen.value = -1;
}

const editorUnopenedAsItems = computed(() => {
    return clientStore.editors.filter(p => !p.isOpened).map((p, i) => ({ value: i, title: p.data?.title ?? p.path })).concat([{ value: -1, title: "--All--" }]);
});

</script>

<template>
    <v-app>
        <v-main class="pa-2">
            <h1>Editor</h1>
            <v-row>
                <v-col cols="3" class="pr-0">
                    <v-autocomplete label="Panel" density="compact" v-model="panelToOpen" :items="editorUnopenedAsItems"
                        :hide-details="true"></v-autocomplete>
                </v-col>
                <v-col cols="1">
                    <v-btn variant="text" color="success" @click="openSlectedPlugin">Open</v-btn>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-card v-for="(pluginData, i) in clientStore.editors" :key="pluginData.path" v-show="pluginData.isOpened">
                <v-card-title class="d-flex">
                    <div class="flex-0-0">
                        {{ pluginData.data?.title ?? "" }}
                    </div>
                    <v-spacer />
                    <div class="flex-0-0">
                        <v-btn icon="mdi-close" variant="text" size="small" color="error"
                            @click="() => clientStore.editorSetOpened(i, false)"></v-btn>
                    </div>
                </v-card-title>
                <component :is="plugins[pluginData.path]"
                    @plugindata="(d: PluginData) => clientStore.editorSetData(i, d)">
                </component>
            </v-card>
        </v-main>
    </v-app>
</template>

<style></style>
