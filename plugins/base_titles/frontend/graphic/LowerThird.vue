<script setup lang="ts">
import baseTitles from "../index";
import { LowerThirdDataKey } from "../index";
import { computed, watch, Ref, ref } from 'vue';

const LOWER_THIRD_WIDTH = "84vw";

const api = await baseTitles.api

const lowerThird = await api.getDataKey<LowerThirdDataKey>("lowerThird");

const isLogoActive = computed(() => {
    return lowerThird?.value?.logoUrl && lowerThird.value.logoUrl.length > 0
});

const outerWidth = ref("0");
const innerOpacity = ref("0");


watch(lowerThird as unknown as Ref<unknown>, (newState: LowerThirdDataKey, oldState: LowerThirdDataKey) => {
    console.log("Watch", newState, oldState);
    if (newState?.isActive) {
        outerWidth.value = LOWER_THIRD_WIDTH;
        setTimeout(() => {
            if (lowerThird?.value?.isActive) {
                innerOpacity.value = "1";
            } else {
                innerOpacity.value = "0";
            }
        }, 200);
    } else {
        innerOpacity.value = "0";
        setTimeout(() => {
            if (!lowerThird?.value?.isActive) {
                outerWidth.value = "0";
            } else {
                outerWidth.value = LOWER_THIRD_WIDTH;
            }
        }, 200);
    }
});
</script>

<style>
.lowerThirdOuterContainer {
    width: 0;
    height: 12.5vh;
    background: rgba(83, 83, 83, 0.5);
    color: white;
    font-size: 5vh;
    line-height: 1em;
    position: absolute;
    bottom: 10vh;
    left: 5vw;
    opacity: 1;
    transition: width 0.25s ease-in-out 0s;
}

.lowerThirdContainer {
    opacity: 0;
    margin: 0 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 2vh;
    padding-left: 2vw;
    padding-right: 1vw;
    flex-wrap: nowrap !important;
    transition: opacity 0.25s ease-in-out 0s;
}

.lowerThirdText {
    white-space: nowrap;
}

.lowerThirdSubtitle {
    font-size: 3.5vh;
    font-style: italic;
    height: 1em;
    white-space: nowrap;
}
</style>

<template>
    <div class="lowerThirdOuterContainer" :style="{ width: outerWidth }">
        <v-row class="lowerThirdContainer" :style="{
        height: !!lowerThird?.subtitle ? '12.5vh' : '9vh',
        opacity: innerOpacity
    }">
            <v-col style="flex-grow: 0; flex-shrink:0;height:100%;" class="pa-0 mr-3 d-flex align-center">
                <img :src="lowerThird?.logoUrl" style="height: 8.5vh;"
                    :style="{ 'display': isLogoActive ? undefined : 'none' }" />
            </v-col>
            <v-col class="pa-0">
                <div v-html="lowerThird?.text" class="lowerThirdText"></div>
                <div v-html="lowerThird?.subtitle" class="lowerThirdSubtitle"></div>
            </v-col>
        </v-row>
    </div>
</template>