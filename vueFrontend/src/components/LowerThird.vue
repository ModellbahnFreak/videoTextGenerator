<template>
    <div class="lowerThirdContainer">
        {{ lowerThirdText }}
    </div>
</template>

<style>
.lowerThirdContainer {
    width: 84vw;
    height: 5vh;
    padding: 2vh;
    padding-left: 5vw;
    padding-right: 1vw;
    background: rgba(0, 0, 0, 0.5);
    font-size: 5vh;
    position: absolute;
    bottom: 8vh;
    line-height: 1em;
    left: 5vw;
    opacity: 1;
    transition: opacity 0.25s ease-in-out 0s;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
    name: "LowerThird",
})
export default class LowerThird extends Vue {
    get lowerThirdText(): string {
        return "Hallo Welt";
    }
}
</script>
