<script setup lang="ts">
import { computed, ref } from 'vue';
import includedEditorsComponents from "./index";
import { shallowRef } from 'vue';

const topic = ref("IncludedEditors");
const dataKey = ref("Test");
const valueStr = ref("");

const api = await includedEditorsComponents.api
let currDataKey = shallowRef({ dataKey: await api.getDataKey(dataKey.value, topic.value) });

async function setValue() {
    currDataKey.value = { dataKey: await api.getDataKey(dataKey.value, topic.value) };
    const topicStr = topic.value;
    const dataKeyStr = dataKey.value;
    let valueParsed = valueStr.value;
    try {
        valueParsed = JSON.parse(valueParsed);
    } catch { }
    currDataKey.value.dataKey?.set(valueParsed);
    valueStr.value = "";
}

async function loadValue() {
    currDataKey.value = { dataKey: await api.getDataKey(dataKey.value, topic.value) };
    valueStr.value = "";
}

function valueInput(value: string) {
    valueStr.value = value;
}

const selectedKeyName = computed(() => {
    return `${currDataKey.value.dataKey?.getTopic()}.${currDataKey.value.dataKey?.getKey()}`;
})
</script>

<template>
    <v-card-text>
        <v-row>
            <v-col>
                <v-text-field label="Topic" variant="underlined" :hide-details="true" v-model="topic"></v-text-field>
            </v-col>
            <v-col>
                <v-text-field label="DataKey" variant="underlined" :hide-details="true"
                    v-model="dataKey"></v-text-field>
            </v-col>
            <v-col cols="1"><v-btn prepend-icon="mdi-send" @click="loadValue">Load</v-btn></v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field label="Value" variant="underlined" :hide-details="true"
                    :model-value="valueStr.length == 0 ? JSON.stringify(currDataKey.dataKey?.value) : valueStr"
                    @update:modelValue="valueInput"></v-text-field>
            </v-col>
            <v-col cols="1"><v-btn prepend-icon="mdi-send" @click="setValue">Exec</v-btn></v-col>
        </v-row>
        <v-row>
            Value of {{ selectedKeyName }} = {{ currDataKey.dataKey }}
        </v-row>
    </v-card-text>
</template>