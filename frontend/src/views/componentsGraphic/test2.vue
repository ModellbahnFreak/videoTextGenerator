<template>
    <span style="background-color: green;">Second test component</span>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

console.log("Second test component SETUP");

onMounted(() => {
    console.log("Second test component MOUNTED");
})
</script>