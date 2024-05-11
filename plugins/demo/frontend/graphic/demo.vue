<script setup lang="ts">
import index from "../index";

</script>

<template>
    <span style="background-color: blue;">This is the demo component!</span>
    <button @click="index.api?.getDataKey('Hallo')">Click</button>
</template>