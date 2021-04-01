<template>
    <div class="lowerThirdOuterContainer" ref="lowerThirdOuterContainer">
        <v-row
            class="lowerThirdContainer"
            ref="lowerThirdContainer"
            :style="{
                height: !!lowerThirdSubtitle ? '12.5vh' : '9vh',
            }"
        >
            <v-col
                style="flex-grow: 0; flex-shrink:0;height:8.5vh;"
                class="pa-0"
            >
                <img src="logo.png" style="height: 100%;" />
            </v-col>
            <v-col class="pa-0">
                <div v-html="lowerThirdText" class="lowerThirdText"></div>
                <div
                    v-html="lowerThirdSubtitle"
                    class="lowerThirdSubtitle"
                ></div>
            </v-col>
        </v-row>
    </div>
</template>

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

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { TextComponent } from "./TextComponent";

@Component({
    name: "LowerThird",
})
export default class LowerThird extends Vue implements TextComponent {
    get lowerThirdText(): string | undefined {
        return this.$store.state.textData.lowerThird;
    }

    get lowerThirdSubtitle(): string | undefined {
        return this.$store.state.textData.lowerThirdSubtitle;
    }

    get isActive(): boolean | undefined {
        return this.$store.state.isActive.lowerThird;
    }

    @Watch("isActive")
    activeChanged(newState: boolean | undefined) {
        if (newState) {
            (this.$refs
                .lowerThirdOuterContainer as HTMLDivElement).style.width =
                "84vw";
            setTimeout(() => {
                if (this.isActive) {
                    (this.$refs
                        .lowerThirdContainer as HTMLDivElement).style.opacity =
                        "1";
                } else {
                    (this.$refs
                        .lowerThirdContainer as HTMLDivElement).style.opacity =
                        "0";
                }
            }, 200);
        } else {
            (this.$refs.lowerThirdContainer as HTMLDivElement).style.opacity =
                "0";
            setTimeout(() => {
                if (!this.isActive) {
                    (this.$refs
                        .lowerThirdOuterContainer as HTMLDivElement).style.width =
                        "0";
                } else {
                    (this.$refs
                        .lowerThirdOuterContainer as HTMLDivElement).style.width =
                        "84vw";
                }
            }, 200);
        }
    }

    setMsg() {}
}
</script>
