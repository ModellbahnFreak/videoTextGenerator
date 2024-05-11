<script setup lang="ts">
import { ref } from 'vue';
import { defineAsyncComponent, type AsyncComponentLoader } from 'vue';
import type { PluginData } from "@videotextgenerator/api";
import { computed } from 'vue';
import { useComponentStore, type ComponentMetadata } from "@/vuePlugins/stores/component"
import { loadAllEditorComponents } from '@/PluginManager';

const componentStore = useComponentStore();
const components = loadAllEditorComponents();

let panelToOpen = ref(-1);

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
    return componentStore.editors.filter(c => !c.isOpened).map((c, i) => ({ value: i, title: getComponentName(c) })).concat([{ value: -1, title: "--All--" }]);
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
            <v-card v-for="(componentData, i) in componentStore.editors" :key="i" v-show="componentData.isOpened">
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

<style></style>
@/vuePlugins/stores/component