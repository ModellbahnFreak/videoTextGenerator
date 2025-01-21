<script setup lang="ts">
import { usePluginStore } from '@/code/pluginManagement/pluginStore';
import type { ComponentMetadata } from '@videotextgenerator/api';
import { provide, type Component } from 'vue';

const pluginStore = usePluginStore();

const props = defineProps<{
    component: Component,
    metadata: ComponentMetadata
}>();

provide("api", pluginStore.pluginsByUuid[props.metadata.pluginUuid].api);
</script>

<template>
    <component :is="component" :api="pluginStore.pluginsByUuid[props.metadata.pluginUuid].api"></component>
</template>