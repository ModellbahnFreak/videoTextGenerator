<script setup lang="ts">
import { useComponentStore } from '@/vuePlugins/stores/component';
import { usePluginStore } from '@/vuePlugins/stores/plugin';

const componentStore = useComponentStore();
const pluginStore = usePluginStore();
</script>

<template>
    <v-dialog max-width="500" transition="fade-transition">
        <template v-slot:activator="{ props: activatorProps }">
            <div id="graphicsOptionButtonContainer">
                <v-btn id="graphicsOptionButton" icon="mdi-dots-grid" v-bind="activatorProps"></v-btn>
            </div>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card title="Options">
                <v-card-text>
                    Visible graphics
                    <v-switch v-for="(pluginData, i) in componentStore.graphics" :key="i"
                        :model-value="pluginData.isOpened"
                        :label="pluginData.title ?? (pluginData.pluginUuid + '/g' + pluginData.indexInPlugin)"
                        :hide-details="true"
                        @update:modelValue="(state) => componentStore.graphicsSetOpened(i, state ?? false)"></v-switch>
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