<script setup lang="ts">
import { useComponentStore } from '@/vuePlugins/stores/component';
import { usePluginStore } from '@/vuePlugins/stores/plugin';
import type { ComponentMetadata } from '@videotextgenerator/api';
import SharedOptions from "@/editor/SharedOptions.vue";

const componentStore = useComponentStore();
const pluginStore = usePluginStore();

const props = defineProps(["clientConfig"]);
const emit = defineEmits(["configChanged"]);

function displayName(componentData: ComponentMetadata): string {
    const pluginName = pluginStore.pluginsByUuid[componentData.pluginUuid].plugin.pluginName ?? componentData.pluginUuid;
    const componentName = componentData.title ?? ("g" + componentData.indexInPlugin.toString(10));
    return pluginName + "/" + componentName;
}
</script>

<template>
    <v-dialog max-width="500" transition="fade-transition">
        <template v-slot:activator="{ props: activatorProps }">
            <div id="graphicsOptionButtonContainer">
                <v-btn id="graphicsOptionButton" :icon="true" v-bind="activatorProps">=</v-btn>
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card title="Options">
                <v-card-text>
                    <SharedOptions :client-config="clientConfig"
                        @config-changed="(newConf) => emit('configChanged', newConf)" />
                    Visible graphics
                    <v-switch v-for="(componentData, i) in componentStore.graphics" :key="i"
                        :model-value="componentData.isOpened" :label="displayName(componentData)" :hide-details="true"
                        @update:modelValue="(state: boolean) => componentStore.graphicsSetOpened(i, state ?? false)"></v-switch>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>

</template>

<style>
#graphicsOptionButtonContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 110px;
    height: 110px;
    opacity: 0;
    transition: opacity ease-in-out 0.25s;
}

#graphicsOptionButtonContainer:hover {
    opacity: 1 !important;
}

#graphicsOptionButton {
    position: absolute;
    top: 30px;
    left: 30px;
}
</style>