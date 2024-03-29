<template>
    <div ref="viewerRoot">
        <component v-for="comp in componentsList" :key="comp.name" :is="comp.component" ref="textComp"></component>
    </div>
</template>

<style></style>

<script lang="ts">
import { TextComponent } from "@/components/TextComponent";
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
    sendSubscribe() {
        this.$socket.send({
            type: "subscribe",
            channel: "viewer",
        });
    }

    created() {
        document.getElementsByTagName("html")[0].style.overflow = "hidden";
        this.sendSubscribe();
        this.$socket.on("connect", this.sendSubscribe.bind(this));
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
                                if (this.$refs.textComp instanceof Array) {
                                    const fullCue: Cue = {
                                        name: cue.name,
                                        value: cue.value,
                                        isActive: cue.isActive ?? !!cue.value,
                                        stringKey: cueStringKey,
                                    };
                                    (this.$refs
                                        .textComp as TextComponent[]).forEach(
                                            (c: TextComponent) => {
                                                c.setMsg(fullCue);
                                            }
                                        );
                                } else {
                                    (this.$refs
                                        .textComp as TextComponent).setMsg(cue);
                                }
                            }
                        });
                    } else if (data.type == "clearAll") {
                        this.$store.commit("clearAll");
                    } else if (data.type == "blackoutOn") {
                        (this.$refs
                            .viewerRoot as HTMLDivElement).style.opacity = "0";
                    } else if (data.type == "blackoutOff") {
                        (this.$refs
                            .viewerRoot as HTMLDivElement).style.opacity = "";
                    }
                }
            }
        );
    }

    mounted() {
        const app = document.getElementById("app");
        if (app) {
            app.style.background = "inherit";
        }
    }

    beforeDestroy() {
        this.$socket.off("connect", this.sendSubscribe.bind(this));
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
        if (typeof cue.value === "string") {
            this.$store.commit("updateKey", {
                key: cueStringKey,
                value: cue.value,
            });
        } else if (cue.value === null) {
            this.$store.commit("deleteKey", cueStringKey);
        }
    }

    get componentsList(): any[] {
        return allComponentsList;
    }
}
</script>
