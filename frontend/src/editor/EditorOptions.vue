<script setup lang="ts">
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';
import { computed, ref, watch } from 'vue';
import SharedOptions from "./SharedOptions.vue";

const { clientConfig } = defineProps(["clientConfig"]);
const emit = defineEmits(["configChanged"]);

const isDialogOpened = ref(false);
</script>

<template>
    <v-dialog max-width="500" transition="fade-transition" v-model="isDialogOpened">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" icon="mdi-cog" variant="text"></v-btn>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card title="Options">
                <v-card-text>
                    <SharedOptions :is-dialog-opened="isDialogOpened" client-config="clientConfig" @config-changed="(newConf) => emit('configChanged', newConf)" />
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>

</template>

<style></style>