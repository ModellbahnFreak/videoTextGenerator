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
import { Cue } from "../Config";

@Component({
    name: "Viewer",

    components: {
        ...allComponents,
    },
})
export default class Viewer extends Vue {
    created() {
        this.$socket.send({
            type: "subscribe",
            channel: "viewer",
        });
        this.$socket.on(
            "viewer",
            (data: { type: string; cue?: Cue | Cue[]; stringKey: string }) => {
                if (typeof data == "object" && typeof data.type === "string") {
                    if (data.type == "set" && data.cue instanceof Array) {
                        data.cue.forEach((cue) => {
                            const cueStringKey =
                                cue.stringKey || data.stringKey;
                            if (typeof cue === "object") {
                                this.updateActiveForCue(cueStringKey, cue);
                                this.updateValueForCue(cueStringKey, cue);
                            }
                        });
                    }
                }
            }
        );
    }

    updateActiveForCue(cueStringKey: string, cue: Cue) {
        const oldActive: boolean | undefined = this.$store.state.isActive[
            cueStringKey
        ];
        if (typeof cue.isActive === "boolean" && cue.isActive !== oldActive) {
            this.$store.commit("updateActive", {
                key: cueStringKey,
                active: cue.isActive,
            });
        } else if (typeof cue.isActive === "undefined" && oldActive !== true) {
            this.$store.commit("updateActive", {
                key: cueStringKey,
                active: true,
            });
        }
    }

    updateValueForCue(cueStringKey: string, cue: Cue) {
        if (typeof cue.value === "undefined") {
            this.$store.commit("deleteKey", cueStringKey);
        } else if (typeof cue.value === "string") {
            this.$store.commit("updateKey", {
                key: cueStringKey,
                value: cue.value,
            });
        }
    }

    get componentsList(): any[] {
        return allComponentsList;
    }
}
</script>
