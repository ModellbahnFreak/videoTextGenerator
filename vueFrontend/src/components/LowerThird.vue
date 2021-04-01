<template>
    <div
        class="lowerThirdContainer"
        :style="{
            opacity: isActive ? 1 : 0,
            height: !!lowerThirdSubtitle ? '12.5vh' : '9vh',
        }"
    >
        <div v-html="lowerThirdText" class="lowerThirdText"></div>
        <div v-html="lowerThirdSubtitle" class="lowerThirdSubtitle"></div>
    </div>
</template>

<style>
.lowerThirdContainer {
    width: 84vw;
    height: 12.5vh;
    padding: 2vh;
    padding-left: 5vw;
    padding-right: 1vw;
    background: rgba(83, 83, 83, 0.5);
    color: white;
    font-size: 5vh;
    line-height: 1em;
    position: absolute;
    bottom: 10vh;
    left: 5vw;
    opacity: 1;
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
import { Component } from "vue-property-decorator";
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

    setMsg() {}
}
</script>
