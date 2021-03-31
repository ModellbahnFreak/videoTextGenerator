<template>
    <div>
        <v-container>
            <v-form ref="form" v-model="formValid">
                <v-row>
                    <v-col>
                        <v-select
                            :items="existingCuelistNames"
                            label="Open new Playlist"
                            :rules="[
                                (val) => !!val || 'Cuelist must be selected',
                            ]"
                            v-model="selCuelist"
                        />
                    </v-col>
                    <v-col
                        style="flex-grow: 0; flex-shrink:0; margin-top:auto; margin-bottom: auto"
                    >
                        <v-btn color="success" text @click="addCuelist"
                            ><v-icon>mdi-plus</v-icon> Add</v-btn
                        >
                    </v-col>
                </v-row>
            </v-form>
            <v-row>
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    v-for="(list, i) in openCuelists"
                    :key="i"
                >
                    <v-card>
                        <v-card-title>
                            {{ list.name }}
                        </v-card-title>
                        <v-list dense>
                            <v-list-item-group v-model="list.selIndex">
                                <v-list-item
                                    v-for="(cue, cueI) in cuelists.get(
                                        list.name
                                    ).cues"
                                    :key="cueI"
                                >
                                    <v-list-item-icon
                                        >{{ cueI }}:</v-list-item-icon
                                    >
                                    <v-list-item-content
                                        :style="{
                                            color:
                                                cueI === list.currIndex
                                                    ? 'green'
                                                    : undefined,
                                        }"
                                    >
                                        <v-list-item-title>{{
                                            getCueName(cue)
                                        }}</v-list-item-title>
                                        <v-list-item-subtitle
                                            >({{
                                                getCueValue(cue)
                                            }})</v-list-item-subtitle
                                        >
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                        <v-card-actions>
                            <v-row>
                                <v-col>
                                    <v-btn
                                        text
                                        color="primary"
                                        @click="goCuelist(i, 1)"
                                    >
                                        Go+
                                    </v-btn>
                                    <v-btn
                                        text
                                        color="warning"
                                        @click="goCuelist(i, -1)"
                                    >
                                        Go-
                                    </v-btn>
                                    <v-btn
                                        text
                                        color="secondary"
                                        @click="goToCuelist(i, list.selIndex)"
                                    >
                                        GoTo
                                    </v-btn>
                                </v-col>
                                <v-col cols="12">
                                    <v-btn
                                        @click="removeCuelist(i)"
                                        icon
                                        color="error"
                                    >
                                        <v-icon>mdi-delete-outline</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import { set } from "node_modules/vue/types/umd";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Config, Cue, Cuelist } from "../Config";

@Component({
    name: "Edit",
})
export default class Edit extends Vue {
    config: Config = { cuelists: [] };
    cuelists: Map<string, Cuelist> = new Map();
    openCuelists: { name: string; currIndex: number; selIndex: number }[] = [];
    formValid: boolean = false;
    selCuelist: string = "";

    created() {
        const that = this;
        this.$socket.send({
            type: "subscribe",
            channel: "editor",
        });
        this.$socket.on("editor", (data: { type: string; config?: Config }) => {
            if (typeof data == "object" && typeof data.type === "string") {
                if (data.type == "set") {
                } else if (
                    data.type == "config" &&
                    typeof data.config === "object"
                ) {
                    Vue.set(that, "config", data.config);
                    Vue.set(that, "cuelists", new Map());
                    that.config?.cuelists?.forEach((l) => {
                        that.cuelists.set(l.name, l);
                    });
                }
            }
        });
    }

    goCuelist(num: number, steps: number) {
        const list = this.openCuelists[num];
        const numSteps = this.cuelists.get(list?.name)?.cues?.length;
        if (list && numSteps) {
            this.goToCuelist(
                num,
                (this.openCuelists[num]?.currIndex + steps) % numSteps
            );
        }
    }

    goToCuelist(num: number, absStep: number) {
        const list = this.openCuelists[num];
        if (list) {
            list.currIndex = absStep;
            list.selIndex = absStep;
        }
    }

    addCuelist() {
        (this.$refs.form as any).validate();
        if (this.formValid) {
            this.openCuelists.push({
                name: this.selCuelist,
                currIndex: -1,
                selIndex: -1,
            });
        }
    }

    removeCuelist(num: number) {
        this.openCuelists.splice(num, 1);
    }

    get existingCuelistNames(): string[] {
        return this.config.cuelists.map((l) => l.name) || [];
    }

    getCueName(cue: Cue | Cue[]): string {
        if (cue instanceof Array) {
            if (cue.length >= 1) {
                return cue[0].name;
            } else {
                return "Unnamed cue";
            }
        } else {
            return cue.name;
        }
    }

    getCueValue(cue: Cue | Cue[]): string {
        if (cue instanceof Array) {
            return cue.map((c) => c.value || "''").join(", ");
        } else {
            return cue.value || "''";
        }
    }
}
</script>
