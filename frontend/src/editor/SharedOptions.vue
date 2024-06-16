<script setup lang="ts">
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';
import { computed, ref, watch } from 'vue';
import { FrontendClientConfig } from "@videotextgenerator/api";

const { isDialogOpened: boolean, clientConfig: FrontendClientConfig } = defineProps(["isDialogOpened", "clientConfig"]);
const emit = defineEmits(["configChanged"]);

const clientName = ref<string | null>(null);
const clientNameModel = computed({
    get: () => clientName.value ?? clientConfig.name ?? "",
    set: (newName: string) => { clientName.value = newName },
});

const identify = computed({
    get: () => clientConfig.identify ?? false,
    set: (doIdentify: boolean) => {
        clientConfig.identify = doIdentify ? true : undefined;
        emit("configChanged", clientConfig);
    },
});

function saveName() {
    if (clientName.value !== null) {
        clientConfig.name = clientName.value.length == 0 ? undefined : clientName.value;
        emit("configChanged", clientConfig);
        clientName.value = null;
    }
}

watch(isDialogOpened as any, (isOpen) => {
    if (!isOpen) {
        clientName.value = null;
    }
})
</script>

<template>
    <v-container>
        <v-row><v-col>Client data</v-col></v-row>
        <v-row>
            <v-col><v-text-field label="Client Name" v-model="clientNameModel"
                    :messages="'Client UUID: ' + clientConfigStore.uuid"></v-text-field></v-col>
            <v-col cols="auto"><v-btn icon="mdi-content-save" variant="text" @click="saveName"></v-btn></v-col>
        </v-row>
        <v-row>
            <v-col><v-switch color="primary" label="Identify" :hide-details="true" v-model="identify" /></v-col>
        </v-row>
    </v-container>
</template>
