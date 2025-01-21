<script setup lang="ts">
import type { FrontendAPI } from '@/code/pluginManagement/FrontendAPI';
import { inject } from 'vue';

const api = inject<FrontendAPI>("api");

const test = await api?.getDataKey("Test");
</script>

<template>
    <span style="background-color: red;">Hello from the test component. Test: {{ test }}</span>
</template>