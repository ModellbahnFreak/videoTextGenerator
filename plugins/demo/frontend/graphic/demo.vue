<script setup lang="ts">
import index from "../index";

</script>

<template>
    <span style="background-color: blue;">This is the demo component!</span>
    <button @click="index.api?.getDataKey('Hallo')">Click</button>
    <img src="/static/7d5cb01a-2913-4d01-a150-91884272cf58/demo_img.svg"></img>
</template>