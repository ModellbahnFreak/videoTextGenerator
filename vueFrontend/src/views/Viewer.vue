<template>
    <div>
        <component
            v-for="comp in componentsList"
            :key="comp.name"
            :is="comp.component"
        ></component>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { allComponents, allComponentsList } from "../components/allComponents";

@Component({
    name: "Viewer",

    components: {
        ...allComponents,
    },
})
export default class Viewer extends Vue {
    get componentsList(): any[] {
        return allComponentsList;
    }
}
</script>
