<script setup lang="ts">
import { computed, ref } from 'vue';
import includedEditorsComponents from "./index";

const topic = ref("IncludedEditors");
const dataKey = ref("Test");
const valueStr = ref("");

const api = await includedEditorsComponents.api
const testDataKey = await api.getDataKey("Test");
console.log(testDataKey);

console.log(await api.getDataKey("Test"));

async function setValue() {
    const topicStr = topic.value;
    const dataKeyStr = dataKey.value;
    let valueParsed = valueStr.value;
    try {
        valueParsed = JSON.parse(valueParsed);
    } catch { }
    (await api.getDataKey(dataKeyStr, topicStr))?.set(valueParsed);
}
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
        </v-row>
        <v-row>
            <v-col>
                <v-text-field label="Value" variant="underlined" :hide-details="true" v-model="valueStr"></v-text-field>
            </v-col>
            <v-col cols="1"><v-btn prepend-icon="mdi-send" @click="setValue">Exec</v-btn></v-col>
        </v-row>
        <v-row>
            Value of IncludedEditors.Test = {{ testDataKey }}
        </v-row>
    </v-card-text>
</template>