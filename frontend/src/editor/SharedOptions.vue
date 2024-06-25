<script setup lang="ts">
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';
import { computed, ref, watch } from 'vue';
import type { FrontendClientConfig } from "@videotextgenerator/api";

const clientConfigStore = useClientConfigStore();

const props = defineProps(["isDialogOpened", "clientConfig"]);
const emit = defineEmits(["configChanged"]);

const clientName = ref<string | null>(null);
const clientNameModel = computed({
    get: () => clientName.value ?? (props.clientConfig as FrontendClientConfig).name ?? "",
    set: (newName: string) => { clientName.value = newName },
});

const identify = computed({
    get: () => (props.clientConfig as FrontendClientConfig).identify ?? false,
    set: (doIdentify: boolean) => {
        (props.clientConfig as FrontendClientConfig).identify = doIdentify ? true : undefined;
        emit("configChanged", (props.clientConfig as FrontendClientConfig));
    },
});

function saveName() {
    if (clientName.value !== null) {
        (props.clientConfig as FrontendClientConfig).name = clientName.value.length == 0 ? undefined : clientName.value;
        emit("configChanged", (props.clientConfig as FrontendClientConfig));
        clientName.value = null;
    }
}

watch(props.isDialogOpened, (isOpen: boolean) => {
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
