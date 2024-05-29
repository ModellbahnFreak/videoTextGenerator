<script setup lang="ts">
import { computed, ref } from 'vue';
import includedEditorsComponents from "./index";
import { shallowRef } from 'vue';
import type { DataKey } from "@videotextgenerator/api";

const topic = ref("IncludedEditors");
const dataKey = ref("Test");
const valueStr = ref<string | null>(null);
const latestEvent = ref("");

const api = await includedEditorsComponents.api
let currDataKey = shallowRef<{ dataKey: DataKey<unknown> | null }>({ dataKey: null });
changeDataKey();

function eventListener(payload: any) {
    latestEvent.value = JSON.stringify(payload);
}

async function changeDataKey() {
    api.off(currDataKey.value.dataKey?.getKey() ?? dataKey.value, eventListener, currDataKey.value.dataKey?.getTopic());
    currDataKey.value = { dataKey: await api.getDataKey(dataKey.value, topic.value) };
    api.on(dataKey.value, eventListener, topic.value);
    latestEvent.value = "";
}

async function setValue() {
    changeDataKey();
    let valueParsed = valueStr.value ?? "";
    try {
        valueParsed = JSON.parse(valueParsed);
    } catch { }
    currDataKey.value.dataKey?.set(valueParsed);
    valueStr.value = null;
}

async function raiseEvent() {
    let valueParsed = valueStr.value ?? "";
    try {
        valueParsed = JSON.parse(valueParsed);
    } catch { }
    api.raise(dataKey.value, valueParsed, topic.value);
    valueStr.value = null;
}

async function loadValue() {
    changeDataKey();
    valueStr.value = null;
}

function valueInput(value: string) {
    valueStr.value = value;
}

const selectedKeyName = computed(() => {
    return `${currDataKey.value.dataKey?.getTopic()}.${currDataKey.value.dataKey?.getKey()}`;
})

const prettyprintJson = computed(() => {
    let str = JSON.stringify(currDataKey.value.dataKey?.value ?? undefined) ?? "";
    if (str.charAt(0) == "\"" && str.charAt(str.length - 1) == "\"") {
        return str.substring(1, str.length - 1);
    }
    return str;
});
</script>

<template>
    <v-card-text>
        <v-row>
            <v-col cols="12" sm="">
                <v-text-field label="Topic" variant="underlined" :hide-details="true" v-model="topic"></v-text-field>
            </v-col>
            <v-col cols="12" sm="">
                <v-text-field label="DataKey/Event" variant="underlined" :hide-details="true"
                    v-model="dataKey"></v-text-field>
            </v-col>
            <v-col cols="auto"><v-btn prepend-icon="mdi-download" @click="loadValue">Load</v-btn></v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="">
                <v-text-field label="Value" variant="underlined" :hide-details="true"
                    :model-value="valueStr == null ? prettyprintJson : valueStr"
                    @update:modelValue="valueInput"></v-text-field>
            </v-col>
            <v-col cols="auto"><v-btn prepend-icon="mdi-upload" @click="setValue">Set</v-btn></v-col>
            <v-col cols="auto"><v-btn prepend-icon="mdi-send" @click="raiseEvent">Event</v-btn></v-col>
        </v-row>
        <v-row>
            <v-col>
                Value of {{ selectedKeyName }} = {{ currDataKey.dataKey }}
            </v-col>
            <v-col>
                Latest received Event of {{ selectedKeyName }}: {{ latestEvent }}
            </v-col>
        </v-row>
    </v-card-text>
</template>