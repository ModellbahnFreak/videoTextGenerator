<template>
    <div
        class="lowerThirdFullOuterContainer"
        ref="lowerThirdFullOuterContainer"
    >
        <v-row class="lowerThirdFullContainer" ref="lowerThirdFullContainer">
            <div v-html="lowerThirdFullText" class="lowerThirdFullText"></div>
            <div
                class="lowerThirdFullSubtitleContainer"
                :style="{
                    height: hasSubtitle ? undefined : '0',
                    visibility: hasSubtitle ? undefined : 'hidden',
                }"
            >
                <div
                    v-html="lowerThirdFullSubtitleA"
                    :style="{
                        height: subtitleState == 1 ? undefined : '0',
                        opacity:
                            subtitleState == 1 &&
                            $store.state.isActive.lowerThirdFullSubtitleA
                                ? '1'
                                : '0',
                        position: subtitleState == 1 ? undefined : 'absolute',
                    }"
                    class="lowerThirdFullSubtitle"
                ></div>
                <div
                    v-html="lowerThirdFullSubtitleB"
                    :style="{
                        height: subtitleState == 2 ? undefined : '0',
                        opacity:
                            subtitleState == 2 &&
                            $store.state.isActive.lowerThirdFullSubtitleB
                                ? '1'
                                : '0',
                        position: subtitleState == 2 ? undefined : 'absolute',
                    }"
                    class="lowerThirdFullSubtitle"
                ></div>
            </div>
        </v-row>
    </div>
</template>

<style>
.lowerThirdFullOuterContainer {
    width: 100vw;
    background: rgba(83, 83, 83, 0.5);
    color: white;
    font-size: 5.5vh;
    line-height: 1em;
    position: absolute;
    bottom: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.25s ease-in-out 0s;
    font-family: "Calibri Light", sans-serif;
}

.lowerThirdFullContainer {
    opacity: 0;
    margin: 0 !important;
    width: 100% !important;
    padding: 3.5vh;
    padding-left: 2vw;
    padding-right: 1vw;
    transition: opacity 0.25s ease-in-out 0s;
}

.lowerThirdFullText {
    white-space: nowrap;
    text-align: center;
    width: 100%;
}

.lowerThirdFullSubtitle {
    width: 100%;
    top: 0;
    left: 0;
    transition: opacity 0.25s ease-in-out 0s;
}
.lowerThirdFullSubtitleContainer {
    font-size: 3.5vh;
    font-style: italic;
    white-space: nowrap;
    text-align: center;
    width: 100%;
    position: relative;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { Cue } from "../Config";
import { TextComponent } from "./TextComponent";

@Component({
    name: "LowerThirdFull",
})
export default class LowerThirdFull extends Vue implements TextComponent {
    private lowerThirdFullText: string = "";

    private lowerThirdFullSubtitleA: string = "";

    private lowerThirdFullSubtitleB: string = "";

    private hasSubtitle: boolean = false;

    private isActive: boolean = false;

    private subtitleState = 1;

    get hasSubtitleImmediate(): boolean | undefined {
        return (
            this.$store.state.isActive.lowerThirdFullSubtitleA ||
            this.$store.state.isActive.lowerThirdFullSubtitleB
        );
    }

    get isMainActive(): boolean | undefined {
        return this.$store.state.isActive.lowerThirdFull;
    }

    get ltTextStore(): string | undefined {
        return this.$store.state.textData.lowerThirdFull;
    }

    get ltSubAStore(): string | undefined {
        return this.$store.state.textData.lowerThirdFullSubtitleA;
    }

    get ltSubBStore(): string | undefined {
        return this.$store.state.textData.lowerThirdFullSubtitleB;
    }

    @Watch("hasSubtitleImmediate")
    hasSubtitleChanged(newHasSubtitle: boolean | undefined) {
        if (this.isMainActive) {
            this.hasSubtitle = newHasSubtitle;
            this.isActive = true;
        } else {
            setTimeout(() => {
                this.hasSubtitle = newHasSubtitle;
            }, 500);
        }
    }

    @Watch("ltTextStore")
    ltTextChaned(newText: string | undefined) {
        if (this.isMainActive) {
            this.lowerThirdFullText = newText ?? "";
            this.isActive = true;
        } else {
            this.isActive = false;
            setTimeout(() => {
                this.lowerThirdFullText = newText ?? "";
            }, 500);
        }
    }

    @Watch("ltSubAStore")
    ltSubAChaned(newText: string | undefined) {
        this.subtitleState = 1;
        if (
            (newText && this.$store.state.isActive.lowerThirdFullSubtitleA) ||
            this.isMainActive
        ) {
            this.isActive = true;
            this.lowerThirdFullSubtitleA = newText ?? "";
        } else {
            setTimeout(() => {
                this.lowerThirdFullSubtitleA = newText ?? "";
            }, 550);
        }
    }

    @Watch("ltSubBStore")
    ltSubBChaned(newText: string | undefined) {
        this.subtitleState = 2;
        if (
            (newText && this.$store.state.isActive.lowerThirdFullSubtitleB) ||
            this.isMainActive
        ) {
            this.isActive = true;
            this.lowerThirdFullSubtitleB = newText ?? "";
        } else {
            setTimeout(() => {
                this.lowerThirdFullSubtitleB = newText ?? "";
            }, 550);
        }
    }

    @Watch("isMainActive")
    mainActiveChanged(newActive: boolean) {
        this.isActive = newActive;
    }

    @Watch("isActive")
    activeChanged(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .lowerThirdFullOuterContainer as HTMLDivElement).style.opacity =
                "1";
            setTimeout(() => {
                if (this.isActive) {
                    (this.$refs
                        .lowerThirdFullContainer as HTMLDivElement).style.opacity =
                        "1";
                } else {
                    (this.$refs
                        .lowerThirdFullContainer as HTMLDivElement).style.opacity =
                        "0";
                }
            }, 300);
        } else {
            (this.$refs
                .lowerThirdFullContainer as HTMLDivElement).style.opacity = "0";
            setTimeout(() => {
                if (!this.isActive) {
                    (this.$refs
                        .lowerThirdFullOuterContainer as HTMLDivElement).style.opacity =
                        "0";
                } else {
                    (this.$refs
                        .lowerThirdFullOuterContainer as HTMLDivElement).style.opacity =
                        "1";
                }
            }, 300);
        }
    }

    setMsg(cue: Cue) {}

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return [
            "lowerThirdFull",
            "lowerThirdFullSubtitleA",
            "lowerThirdFullSubtitleB",
        ];
    }
}
</script>
