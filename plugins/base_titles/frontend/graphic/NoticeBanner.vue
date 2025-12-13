<script setup lang="ts">
import baseTitles, { NoticeBannerDataKey } from "../index";
import { LowerThirdDataKey } from "../index";
import { computed, watch, Ref, ref, inject } from 'vue';
import type { APIBase, DataKey } from "@videotextgenerator/api";
import { Animator } from "../Animator";

const api = inject<APIBase>("api");

const noticeBanner = await api?.getDataKey("noticeBanner") as (DataKey<NoticeBannerDataKey> & Ref<NoticeBannerDataKey>);

const outerHeight = ref(0);
const innerOpacity = ref("0");

const anim = new Animator();

async function hideBanner() {
    anim.runAnimation(async (sleep) => {
        innerOpacity.value = "0";
        await sleep(200, () => !noticeBanner?.value?.isActive);
        outerHeight.value = 0;
    });
}

async function showBanner() {
    anim.runAnimation(async (sleep) => {
        outerHeight.value = 1;
        await sleep(200, () => noticeBanner?.value?.isActive);
        innerOpacity.value = "1";
    });
}

noticeBanner.on(newState => {
    if (newState?.isActive) {
        showBanner();
    } else {
        hideBanner();
    }
});
</script>

<style>
.noticeBannerOuterContainer {
    font-family: Roboto, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 6vh;
    line-height: 1em;

    position: absolute;
    bottom: 0;
    left: 0;
    width: 100vw;
    transition: height 0.3s ease-in-out 0s;
}

.noticeBannerContainer {
    width: 100% !important;
    height: 100% !important;
    transition: opacity 0.25s ease-in-out 0s;

    padding: 3vh;
}

.noticeBannerTitle {
    font-size: 15vh;
    line-height: 1em;
    font-weight: bold;
    height: 1.1em;
    white-space: nowrap;
    width: 100%;
}

.noticeBannerText {
    width: 100%;
}
</style>

<template>
    <div class="noticeBannerOuterContainer" :style="{
        backgroundColor: noticeBanner?.bgColor ?? '#3c3c3c',
        color: noticeBanner?.color ?? 'white',
        height: outerHeight * 30 + 'vh',
        marginLeft: noticeBanner?.paddingLeft + 'vw',
    }">
        <div class="noticeBannerContainer" :style="{
            opacity: innerOpacity
        }">
            <div>
                <div v-html="noticeBanner?.title" v-if="noticeBanner?.title" class="noticeBannerTitle"></div>
                <div v-html="noticeBanner?.text" v-if="noticeBanner?.text" class="noticeBannerText"></div>
            </div>
        </div>
    </div>
</template>