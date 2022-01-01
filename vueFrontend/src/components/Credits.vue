<template>
    <div class="creditsOuterContainer" ref="creditsOuterContainer">
        <v-row class="creditsContainer" ref="creditsContainer">
            <div class="creditsTitleContainer">
                <div
                    v-html="creditsTextA"
                    class="creditsText"
                    :style="{
                        opacity: ltState == 1 ? '1' : '0',
                        position: ltState == 1 ? undefined : 'absolute',
                    }"
                ></div>
                <div
                    v-html="creditsTextB"
                    class="creditsText"
                    :style="{
                        opacity: ltState == 2 ? '1' : '0',
                        position: ltState == 2 ? undefined : 'absolute',
                    }"
                ></div>
            </div>
            <div class="creditsContentContainer" ref="creditsContentContainer">
                <div
                    v-html="creditsContentA"
                    :style="{
                        opacity: ContentState == 1 ? '1' : '0',
                        position: ContentState == 1 ? undefined : 'absolute',
                    }"
                    class="creditsContent"
                ></div>
                <div
                    v-html="creditsContentB"
                    :style="{
                        opacity: ContentState == 2 ? '1' : '0',
                        position: ContentState == 2 ? undefined : 'absolute',
                    }"
                    class="creditsContent"
                ></div>
            </div>
        </v-row>
    </div>
</template>

<style>
.creditsTitleContainer {
    width: 100%;
    height: 100%;
    position: relative;
    margin-bottom: 3vh;
}
.creditsOuterContainer {
    width: 50vw;
    height: 100vh;
    background: rgba(83, 83, 83, 0.5);
    color: white;
    font-size: 5.5vh;
    line-height: 1em;
    position: absolute;
    right: 0;
    top: 0;
    opacity: 0;
    transition: opacity 0.25s ease-in-out 0s;
    font-family: "Calibri Light", sans-serif;
}

.creditsContainer {
    opacity: 0;
    margin: 0 !important;
    width: 100% !important;
    padding: 3.5vh;
    padding-left: 2vw;
    padding-right: 1vw;
    transition: opacity 0.25s ease-in-out 0s;
}

.creditsText {
    white-space: nowrap;
    text-align: center;
    width: 100%;
    top: 0;
    left: 0;
    transition: opacity 0.25s ease-in-out 0s;
}

.creditsContent {
    width: 100%;
    top: 0;
    left: 0;
    transition: opacity 0.25s ease-in-out 0s;
}
.creditsContentContainer {
    line-height: 0.85em;
    font-size: 4vh;
    white-space: nowrap;
    text-align: left;
    width: 100%;
    position: relative;
    transition: opacity 0.25s ease-in-out 0s;
}
.creditsTitle {
    font-style: italic;
    font-size: 3vh;
    margin-bottom: 0 !important;
}
.creditsNames {
    margin-left: 5vh;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { Cue } from "../Config";
import { TextComponent } from "./TextComponent";

@Component({
    name: "credits",
})
export default class credits extends Vue implements TextComponent {
    private readonly animationDuration = 500;

    private ltState: number = 1;

    private creditsTextA: string = "";

    private creditsTextB: string = "";

    private creditsContentA: string = "";

    private creditsContentB: string = "";

    private ContentState = 1;

    get hasContentImmediate(): boolean | undefined {
        return this.$store.state.isActive.creditsContent;
    }

    get isMainActive(): boolean | undefined {
        return this.$store.state.isActive.credits;
    }

    get ltTextStore(): string | undefined {
        return this.$store.state.textData.credits;
    }

    get ltSubStore(): string | undefined {
        return this.$store.state.textData.creditsContent;
    }

    @Watch("ltTextStore")
    ltTextChaned(newText: string | undefined) {
        if (this.isMainActive) {
            this.changeActivation(true);
            if (this.ltState === 1) {
                this.creditsTextB = newText ?? "";
                this.ltState = 2;
                setTimeout(() => {
                    this.creditsTextA = "";
                }, this.animationDuration);
            } else if (this.ltState === 2) {
                this.creditsTextA = newText ?? "";
                this.ltState = 1;
                setTimeout(() => {
                    this.creditsTextB = "";
                }, this.animationDuration);
            }
        } else {
            this.changeActivation(false);
            setTimeout(() => {
                if (this.ltState === 1) {
                    this.creditsTextB = newText ?? "";
                    this.ltState = 2;
                    this.creditsTextA = "";
                } else if (this.ltState === 2) {
                    this.creditsTextA = newText ?? "";
                    this.ltState = 1;
                    this.creditsTextB = "";
                }
            }, this.animationDuration);
        }
    }

    @Watch("ltSubStore")
    ltSubChaned(newText: string | undefined) {
        if (this.hasContentImmediate) {
            this.changeActivation(true);
            if (this.ContentState === 1) {
                this.creditsContentB = newText ?? "";
                this.ContentState = 2;
                setTimeout(() => {
                    this.creditsContentA = "";
                }, this.animationDuration);
            } else if (this.ContentState === 2) {
                this.creditsContentA = newText ?? "";
                this.ContentState = 1;
                setTimeout(() => {
                    this.creditsContentB = "";
                }, this.animationDuration);
            }
        } else {
            if (!this.isMainActive) {
                this.changeActivation(false);
            }
            setTimeout(() => {
                if (this.ContentState === 1) {
                    this.creditsContentB = newText ?? "";
                    this.ContentState = 2;
                    this.creditsContentA = "";
                } else if (this.ContentState === 2) {
                    this.creditsContentA = newText ?? "";
                    this.ContentState = 1;
                    this.creditsContentB = "";
                }
            }, this.animationDuration);
        }
    }

    @Watch("hasContentImmediate")
    changeContentVisible(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .creditsContentContainer as HTMLDivElement).style.height = "";
            (this.$refs
                .creditsContentContainer as HTMLDivElement).style.opacity = "1";
        } else {
            (this.$refs
                .creditsContentContainer as HTMLDivElement).style.opacity = "0";
            setTimeout(() => {
                (this.$refs
                    .creditsContentContainer as HTMLDivElement).style.height =
                    "0";
            }, this.animationDuration);
        }
    }

    @Watch("isMainActive")
    changeActivation(newState: boolean | undefined) {
        if (newState) {
            (this.$refs.creditsOuterContainer as HTMLDivElement).style.opacity =
                "1";
            setTimeout(() => {
                (this.$refs.creditsContainer as HTMLDivElement).style.opacity =
                    "1";
            }, 300);
        } else {
            (this.$refs.creditsContainer as HTMLDivElement).style.opacity = "0";
            setTimeout(() => {
                (this.$refs
                    .creditsOuterContainer as HTMLDivElement).style.opacity =
                    "0";
            }, 300);
        }
    }

    setMsg(cue: Cue) {}

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return ["credits", "creditsContent"];
    }
}
</script>
