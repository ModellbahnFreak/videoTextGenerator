<script setup lang="ts">
import type { PluginData } from '@videotextgenerator/api';

const pluginData: PluginData = { title: "Commandline" }
const emit = defineEmits(["plugindata"]);
emit("plugindata", pluginData);

</script>

<template>
    <v-card-text>
        Hallo Welt Editor
    </v-card-text>
</template>