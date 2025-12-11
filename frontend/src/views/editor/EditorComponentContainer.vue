<script setup lang="ts">
import { useComponentStore } from '@/code/pluginManagement/componentStore';
import { usePluginStore } from '@/code/pluginManagement/pluginStore';
import type { ComponentMetadata } from '@videotextgenerator/api';
import { provide, type Component } from 'vue';

const componentStore = useComponentStore();
const pluginStore = usePluginStore();
const props = defineProps<{
    metadata: ComponentMetadata,
    i: number,
    component: Component,
    name: string
}>()

provide("api", pluginStore.pluginsByUuid[props.metadata.pluginUuid].api);

</script>

<template>
    <v-card-title class="d-flex">
        <div class="flex-0-0">
            {{ props.name }}
        </div>
        <v-spacer />
        <div class="flex-0-0">
            <v-btn icon="mdi-close" variant="text" size="small" color="error"
                @click="() => componentStore.editorSetOpened(i, false)"></v-btn>
        </div>
    </v-card-title>
    <Suspense>
        <component :is="props.component" :api="pluginStore.pluginsByUuid[props.metadata.pluginUuid].api">
        </component>
        <template #fallback>
            Loading Editor from {{ pluginStore.pluginsByUuid[props.metadata.pluginUuid].folderName }}...
        </template>
    </Suspense>
</template>