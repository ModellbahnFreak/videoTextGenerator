<script setup lang="ts">

import { ref, watch, Ref, inject, toRaw } from "vue";
import baseTitles, { LowerThirdDataKey, NoticeBannerDataKey } from "../index";
import type { APIBase, DataKey } from "@videotextgenerator/api";

const api = inject<APIBase>("api");
const lowerThird = await api?.getDataKey<LowerThirdDataKey>("lowerThird");
const noticeBanner = await api?.getDataKey<NoticeBannerDataKey>("noticeBanner") as (DataKey<NoticeBannerDataKey> & Ref<NoticeBannerDataKey>);

const selectedTitle = ref("lowerThird");

const lowerThirdText = ref("");
const lowerThirdSubtitle = ref("");
const lowerThirdIsActive = ref(false);

const noticeBannerLocal = ref({
    isActive: false,
    title: "",
    text: "",
    bgColor: "#3c3c3c",
    color: "white",
    paddingLeft: 0,
});

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

function updateNoticeBanner() {
    Object.assign(noticeBanner?.value, toRaw(noticeBannerLocal.value));
}
watch(noticeBanner, () => {
    Object.assign(noticeBannerLocal.value, toRaw(noticeBanner?.value));
});
</script>

<template>
    <v-tabs v-model="selectedTitle">
        <v-tab value="lowerThird">Lower Third</v-tab>
        <v-tab value="subtitle">Subtitle</v-tab>
        <v-tab value="noticeBanner">Notice Banner</v-tab>
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

            <v-tabs-window-item value="noticeBanner">
                <v-row @keydown.enter="updateNoticeBanner">
                    <v-col cols="12" sm=""><v-text-field label="Title" v-model="noticeBannerLocal.title"
                            :hide-details="true"></v-text-field></v-col>
                    <v-col cols="12" sm=""><v-text-field label="Text" v-model="noticeBannerLocal.text"
                            :hide-details="true"></v-text-field></v-col>
                    <v-col cols="auto"><v-switch label="Visible" v-model="noticeBannerLocal.isActive" color="primary"
                            @update:modelValue="updateNoticeBanner" :hide-details="true"></v-switch></v-col>
                </v-row>
                <v-row @keydown.enter="updateNoticeBanner">
                    <v-col cols="auto">
                        <v-dialog :max-width="350">
                            <template v-slot:activator="{ props: activatorProp }">
                                Text color: <v-btn icon v-bind="activatorProp"
                                    :style="{ background: noticeBannerLocal.color }"></v-btn>
                            </template>
                            <template v-slot:default="{ isActive }">
                                <v-card :title="'Text color'">
                                    <v-card-text>
                                        <v-row>
                                            <v-col><v-color-picker mode="hex"
                                                    v-model="noticeBannerLocal.color"></v-color-picker>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn text="OK"
                                            @click="() => { isActive.value = false; updateNoticeBanner(); }"></v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>
                    </v-col>
                    <v-col cols="auto">
                        <v-dialog :max-width="350">
                            <template v-slot:activator="{ props: activatorProp }">
                                Background color: <v-btn icon v-bind="activatorProp"
                                    :style="{ background: noticeBannerLocal.bgColor }"></v-btn>
                            </template>
                            <template v-slot:default="{ isActive }">
                                <v-card :title="'Background color'">
                                    <v-card-text>
                                        <v-row>
                                            <v-col><v-color-picker mode="hex"
                                                    v-model="noticeBannerLocal.bgColor"></v-color-picker>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn text="OK"
                                            @click="() => { isActive.value = false; updateNoticeBanner(); }"></v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>
                    </v-col>
                    <v-col cols="12" sm="5" md="3">
                        <v-number-input v-model="noticeBannerLocal.paddingLeft" :hideDetails="true" :min="0" :max="100"
                            :step="0.01" :precision="2" label="Position from left"></v-number-input>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card-text>

</template>