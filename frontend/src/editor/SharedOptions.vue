<script setup lang="ts">
import { useClientConfigStore } from '@/vuePlugins/stores/clientConfig';
import { computed, ref, watch } from 'vue';

const { isDialogOpened } = defineProps(["isDialogOpened"]);

const clientConfigStore = useClientConfigStore();

const clientName = ref<string | null>(null);
const clientNameModel = computed({
    get: () => clientName.value ?? clientConfigStore.config.name ?? "",
    set: (newName: string) => { clientName.value = newName },
});

const identify = computed({
    get: () => clientConfigStore.config.identify ?? false,
    set: (doIdentify: boolean) => {
        clientConfigStore.config.identify = doIdentify ? true : undefined;
        clientConfigStore.storeAndSendConfig();
    },
});

function saveName() {
    if (clientName.value !== null) {
        clientConfigStore.config.name = clientName.value.length == 0 ? undefined : clientName.value;
        clientConfigStore.storeAndSendConfig();
        clientName.value = null;
    }
}

watch(isDialogOpened, (isOpen) => {
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
                    :messages="'My UUID: ' + clientConfigStore.uuid"></v-text-field></v-col>
            <v-col cols="auto"><v-btn icon="mdi-content-save" variant="text" @click="saveName"></v-btn></v-col>
        </v-row>
        <v-row>
            <v-col><v-switch color="primary" label="Identify" :hide-details="true" v-model="identify" /></v-col>
        </v-row>
    </v-container>
</template>
