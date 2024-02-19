<template>
    <div class="titleOuterContainer pa-0 mr-3 d-flex align-center flex-wrap" ref="titleOuterContainer">
        <div class="titleContainer">
            <div class="titleText" v-html="titleText"></div>
            <div class="titleSubtitleText" v-html="titleSubtitleText"></div>
        </div>
    </div>
</template>

<style>
.titleOuterContainer {
    color: black;
    line-height: 1.25em;
    font-size: 10vh;
    font-family: Pikolo, Roboto, sans-serif;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.25s ease-in-out 0s;
}

.titleOuterContainer>* {
    margin: 0 !important;
    width: 100% !important;
    flex-wrap: nowrap !important;
    text-align: center;
    flex: 0 0 auto;
}

.titleText {
    font-size: 15vh;
    font-family: Roboto, sans-serif;
    margin-bottom: 2vh;
}

.titleSubtitleText {
    font-size: 8vh;
    font-family: Roboto, sans-serif;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { TextComponent } from "./TextComponent";

const title_HEIGHT = "25.93vh";

@Component({
    name: "Title",
})
export default class Title extends Vue implements TextComponent {
    get titleText(): string | undefined {
        return this.$store.state.textData.title;
    }

    get titleSubtitleText(): string | undefined {
        return this.$store.state.textData.titleSubtitle;
    }

    get isActive(): boolean | undefined {
        return this.$store.state.isActive.title;
    }

    @Watch("isActive")
    activeChanged(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .titleOuterContainer as HTMLDivElement).style.opacity = "1"
            title_HEIGHT;
            (this.$refs
                .titleOuterContainer as HTMLDivElement).style.transform = "scale(1)"
            title_HEIGHT;
            setTimeout(() => {
                if (this.isActive) {
                    (this.$refs
                        .titleOuterContainer as HTMLDivElement).style.transition = "opacity 0.25s ease-in-out 0s"
                    title_HEIGHT;
                }
            }, 250);
        } else {
            (this.$refs
                .titleOuterContainer as HTMLDivElement).style.opacity = "0"
            title_HEIGHT;
            setTimeout(() => {
                if (!this.isActive) {
                    (this.$refs
                        .titleOuterContainer as HTMLDivElement).style.transition = "transform 0.25s ease-in-out 0s"
                    title_HEIGHT;
                    (this.$refs
                        .titleOuterContainer as HTMLDivElement).style.transform = "scale(0)"
                    title_HEIGHT;
                }
            }, 250);
        }
    }

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return ["title", "titleSubtitle"];
    }

    setMsg() { }
}
</script>
