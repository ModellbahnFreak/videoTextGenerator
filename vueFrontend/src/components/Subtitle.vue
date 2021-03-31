<template>
    <div
        class="subtitleContainer"
        :style="{ opacity: this.$store.state.isActive.subtitle ? 1 : 0 }"
    >
        <div
            v-html="subtitleTextA"
            class="subtitleContent"
            :style="{ opacity: aOpacity }"
        ></div>
        <div
            v-html="subtitleTextB"
            class="subtitleContent"
            :style="{ opacity: bOpacity }"
        ></div>
    </div>
</template>

<style>
.subtitleContainer {
    width: 100vw;
    height: 3vh;
    padding-left: 5vw;
    padding-right: 5vw;
    background: rgba(0, 0, 0, 0);
    color: white;
    font-size: 3vh;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    text-align: center;
    line-height: 1em;
    position: absolute;
    bottom: 3vh;
    left: 0vw;
    opacity: 1;
    transition: opacity 0.25s ease-in-out 0s;
}
.subtitleContent {
    vertical-align: middle;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    padding-left: 5vw;
    padding-right: 5vw;
    transition: opacity 0.25s ease-in-out 0s;
}
</style>

<script lang="ts">
import { Cue } from "@/Config";
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { TextComponent } from "./TextComponent";

@Component({
    name: "Subtitle",
})
export default class Subtitle extends Vue implements TextComponent {
    aOpacity = 0;
    bOpacity = 0;

    @Watch("isSubtitleActive")
    activeChange(newState: boolean | undefined) {
        if (!newState) {
            this.aOpacity = 0;
            this.bOpacity = 0;
        }
    }

    get isSubtitleActive(): boolean | undefined {
        return this.$store.state.isActive.subtitle;
    }

    setMsg(cue: Cue) {
        if (cue.stringKey == "subtitleA") {
            this.aOpacity = 1;
            this.bOpacity = 0;
        } else if (cue.stringKey == "subtitleB") {
            this.aOpacity = 0;
            this.bOpacity = 1;
        }
    }

    get subtitleTextA(): string {
        return this.$store.state.textData.subtitleA;
    }
    get subtitleTextB(): string {
        return this.$store.state.textData.subtitleB;
    }
}
</script>
