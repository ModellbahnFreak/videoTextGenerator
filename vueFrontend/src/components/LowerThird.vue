<template>
    <div
        class="lowerThirdContainer"
        :style="{ opacity: this.$store.state.isActive.lowerThird ? 1 : 0 }"
    >
        <span v-html="lowerThirdText" style="vertical-align:middle"></span>
    </div>
</template>

<style>
.lowerThirdContainer {
    width: 84vw;
    height: 10vh;
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
</style>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { TextComponent } from "./TextComponent";

@Component({
    name: "LowerThird",
})
export default class LowerThird extends Vue implements TextComponent {
    get lowerThirdText(): string {
        return this.$store.state.textData.lowerThird;
    }

    setMsg() {}
}
</script>
