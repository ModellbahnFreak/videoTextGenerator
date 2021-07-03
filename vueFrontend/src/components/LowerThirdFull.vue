<template>
    <div
        class="lowerThirdFullOuterContainer"
        ref="lowerThirdFullOuterContainer"
    >
        <v-row class="lowerThirdFullContainer" ref="lowerThirdFullContainer">
            <div class="lowerThirdFullTitleContainer">
                <div
                    v-html="lowerThirdFullTextA"
                    class="lowerThirdFullText"
                    :style="{
                        opacity: ltState == 1 ? '1' : '0',
                        position: ltState == 1 ? undefined : 'absolute',
                    }"
                ></div>
                <div
                    v-html="lowerThirdFullTextB"
                    class="lowerThirdFullText"
                    :style="{
                        opacity: ltState == 2 ? '1' : '0',
                        position: ltState == 2 ? undefined : 'absolute',
                    }"
                ></div>
            </div>
            <div
                class="lowerThirdFullSubtitleContainer"
                ref="lowerThirdFullSubtitleContainer"
            >
                <div
                    v-html="lowerThirdFullSubtitleA"
                    :style="{
                        opacity: subtitleState == 1 ? '1' : '0',
                        position: subtitleState == 1 ? undefined : 'absolute',
                    }"
                    class="lowerThirdFullSubtitle"
                ></div>
                <div
                    v-html="lowerThirdFullSubtitleB"
                    :style="{
                        opacity: subtitleState == 2 ? '1' : '0',
                        position: subtitleState == 2 ? undefined : 'absolute',
                    }"
                    class="lowerThirdFullSubtitle"
                ></div>
            </div>
        </v-row>
    </div>
</template>

<style>
.lowerThirdFullTitleContainer {
    width: 100%;
    height: 100%;
    position: relative;
}
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
    top: 0;
    left: 0;
    transition: opacity 0.25s ease-in-out 0s;
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
    transition: opacity 0.25s ease-in-out 0s;
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
    private readonly animationDuration = 500;

    private ltState: number = 1;

    private lowerThirdFullTextA: string = "";

    private lowerThirdFullTextB: string = "";

    private lowerThirdFullSubtitleA: string = "";

    private lowerThirdFullSubtitleB: string = "";

    private subtitleState = 1;

    get hasSubtitleImmediate(): boolean | undefined {
        return this.$store.state.isActive.lowerThirdFullSubtitle;
    }

    get isMainActive(): boolean | undefined {
        return this.$store.state.isActive.lowerThirdFull;
    }

    get ltTextStore(): string | undefined {
        return this.$store.state.textData.lowerThirdFull;
    }

    get ltSubStore(): string | undefined {
        return this.$store.state.textData.lowerThirdFullSubtitle;
    }

    @Watch("ltTextStore")
    ltTextChaned(newText: string | undefined) {
        if (this.isMainActive) {
            this.changeActivation(true);
            if (this.ltState === 1) {
                this.lowerThirdFullTextB = newText ?? "";
                this.ltState = 2;
                setTimeout(() => {
                    this.lowerThirdFullTextA = "";
                }, this.animationDuration);
            } else if (this.ltState === 2) {
                this.lowerThirdFullTextA = newText ?? "";
                this.ltState = 1;
                setTimeout(() => {
                    this.lowerThirdFullTextB = "";
                }, this.animationDuration);
            }
        } else {
            this.changeActivation(false);
            setTimeout(() => {
                if (this.ltState === 1) {
                    this.lowerThirdFullTextB = newText ?? "";
                    this.ltState = 2;
                    this.lowerThirdFullTextA = "";
                } else if (this.ltState === 2) {
                    this.lowerThirdFullTextA = newText ?? "";
                    this.ltState = 1;
                    this.lowerThirdFullTextB = "";
                }
            }, this.animationDuration);
        }
    }

    @Watch("ltSubStore")
    ltSubChaned(newText: string | undefined) {
        if (this.hasSubtitleImmediate) {
            this.changeActivation(true);
            if (this.subtitleState === 1) {
                this.lowerThirdFullSubtitleB = newText ?? "";
                this.subtitleState = 2;
                setTimeout(() => {
                    this.lowerThirdFullSubtitleA = "";
                }, this.animationDuration);
            } else if (this.subtitleState === 2) {
                this.lowerThirdFullSubtitleA = newText ?? "";
                this.subtitleState = 1;
                setTimeout(() => {
                    this.lowerThirdFullSubtitleB = "";
                }, this.animationDuration);
            }
        } else {
            if (!this.isMainActive) {
                this.changeActivation(false);
            }
            setTimeout(() => {
                if (this.subtitleState === 1) {
                    this.lowerThirdFullSubtitleB = newText ?? "";
                    this.subtitleState = 2;
                    this.lowerThirdFullSubtitleA = "";
                } else if (this.subtitleState === 2) {
                    this.lowerThirdFullSubtitleA = newText ?? "";
                    this.subtitleState = 1;
                    this.lowerThirdFullSubtitleB = "";
                }
            }, this.animationDuration);
        }
    }

    @Watch("hasSubtitleImmediate")
    changeSubtitleVisible(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .lowerThirdFullSubtitleContainer as HTMLDivElement).style.visibility =
                "";
            (this.$refs
                .lowerThirdFullSubtitleContainer as HTMLDivElement).style.opacity =
                "1";
        } else {
            (this.$refs
                .lowerThirdFullSubtitleContainer as HTMLDivElement).style.opacity =
                "0";
            setTimeout(() => {
                (this.$refs
                    .lowerThirdFullSubtitleContainer as HTMLDivElement).style.visibility =
                    "collapse";
            }, this.animationDuration);
        }
    }

    @Watch("isMainActive")
    changeActivation(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .lowerThirdFullOuterContainer as HTMLDivElement).style.opacity =
                "1";
            setTimeout(() => {
                (this.$refs
                    .lowerThirdFullContainer as HTMLDivElement).style.opacity =
                    "1";
            }, 300);
        } else {
            (this.$refs
                .lowerThirdFullContainer as HTMLDivElement).style.opacity = "0";
            setTimeout(() => {
                (this.$refs
                    .lowerThirdFullOuterContainer as HTMLDivElement).style.opacity =
                    "0";
            }, 300);
        }
    }

    setMsg(cue: Cue) {}

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return ["lowerThirdFull", "lowerThirdFullSubtitle"];
    }
}
</script>
