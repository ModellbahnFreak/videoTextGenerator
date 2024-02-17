<template>
    <div class="questionOuterContainer" ref="questionOuterContainer">
        <v-row class="questionContainer" ref="questionContainer" :style="{
            height: !!questionSubtitle ? '12.5vh' : '9vh',
        }">
            <v-col class="pa-0">
                <div class="questionTitle">Frage: </div>
                <div v-html="questionText" class="questionText"></div>
                <div v-html="questionSubtitle" class="questionSubtitle"></div>
            </v-col>
        </v-row>
    </div>
</template>

<style>
.questionOuterContainer {
    width: 70vw;
    height: 0;
    /*background: rgba(83, 83, 83, 0.5);*/
    background: #dee1db;
    color: white;
    font-size: 4vh;
    line-height: 1em;
    position: absolute;
    top: 74.07vh;
    left: 0vw;
    opacity: 1;
    transition: height 0.25s ease-in-out 0s;
}

.questionContainer {
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

.questionTitle {
    font-family: Roboto, sans-serif;
    font-weight: bold;
}

.questionText {
    font-family: Roboto, sans-serif;
    width: 100%;
    /*font-weight: bold;*/
}

.questionSubtitle {
    font-family: Roboto, sans-serif;
    font-size: 5vh;
    /*font-weight: lighter;*/
    height: 1em;
    white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { TextComponent } from "./TextComponent";

const QUESTION_HEIGHT = "25.93vh";

@Component({
    name: "Question",
})
export default class Question extends Vue implements TextComponent {
    get questionText(): string | undefined {
        return this.$store.state.textData.question;
    }

    get questionSubtitle(): string | undefined {
        return this.$store.state.textData.questionSubtitle;
    }

    get isActive(): boolean | undefined {
        return this.$store.state.isActive.question;
    }

    @Watch("isActive")
    activeChanged(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .questionOuterContainer as HTMLDivElement).style.height =
                QUESTION_HEIGHT;
            setTimeout(() => {
                if (this.isActive) {
                    (this.$refs
                        .questionContainer as HTMLDivElement).style.opacity =
                        "1";
                } else {
                    (this.$refs
                        .questionContainer as HTMLDivElement).style.opacity =
                        "0";
                }
            }, 200);
        } else {
            (this.$refs.questionContainer as HTMLDivElement).style.opacity =
                "0";
            setTimeout(() => {
                if (!this.isActive) {
                    (this.$refs
                        .questionOuterContainer as HTMLDivElement).style.height =
                        "0";
                } else {
                    (this.$refs
                        .questionOuterContainer as HTMLDivElement).style.height =
                        QUESTION_HEIGHT;
                }
            }, 200);
        }
    }

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return ["question", "questionSubtitle"];
    }

    setMsg() { }
}
</script>
