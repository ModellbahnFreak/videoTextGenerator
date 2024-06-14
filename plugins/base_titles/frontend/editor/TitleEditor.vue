<script setup lang="ts">

import { ref, watch, Ref } from "vue";
import baseTitles, { LowerThirdDataKey } from "../index";

const api = await baseTitles.api;
const lowerThird = await api.getDataKey<LowerThirdDataKey>("lowerThird");

const selectedTitle = ref("lowerThird");

const lowerThirdText = ref("");
const lowerThirdSubtitle = ref("");
const lowerThirdIsActive = ref(false);

watch(lowerThird as unknown as Ref<LowerThirdDataKey>, val => {
    lowerThirdText.value = val?.text;
    lowerThirdSubtitle.value = val?.subtitle;
    lowerThirdIsActive.value = val?.isActive;
})

function updateLowerThird() {
    lowerThird?.set({
        text: lowerThirdText.value,
        subtitle: lowerThirdSubtitle.value,
        isActive: lowerThirdIsActive.value,
        logoUrl: "",
    })
}
</script>

<template>
    <v-tabs v-model="selectedTitle">
        <v-tab value="lowerThird">Lower Third</v-tab>
        <v-tab value="subtitle">Subtitle</v-tab>
    </v-tabs>
    <v-card-text>
        <v-tabs-window v-model="selectedTitle">
            <v-tabs-window-item value="lowerThird">
                <v-row @keydown.enter="updateLowerThird">
                    <v-col cols="12" sm=""><v-text-field label="Text" v-model="lowerThirdText"></v-text-field></v-col>
                    <v-col cols="12" sm=""><v-text-field label="Subtitle"
                            v-model="lowerThirdSubtitle"></v-text-field></v-col>
                    <v-col cols="auto"><v-switch label="Visible" v-model="lowerThirdIsActive" color="primary"
                            @update:modelValue="updateLowerThird"></v-switch></v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="subtitle">
                Todo
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card-text>

</template>