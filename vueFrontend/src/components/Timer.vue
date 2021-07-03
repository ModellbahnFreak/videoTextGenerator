<template>
    <div class="timerContainer" :style="{ opacity: timerOpacity }">
        <span>{{ timerPreText }}</span>
        <span>{{ timerStr }}</span>
        <span>{{ timerPostText }}</span>
    </div>
</template>

<style>
.timerContainer {
    padding: 0.3em;
    background: rgba(83, 83, 83, 0.5);
    color: white;
    font-size: 4vh;
    line-height: 1em;
    position: absolute;
    bottom: 4vh;
    right: 3vw;
    transition: opacity 0.25s ease-in-out 0s;
}
</style>

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import { Cue } from "../Config";
import { TextComponent } from "./TextComponent";

@Component({
    name: "Timer",
})
export default class Timer extends Vue implements TextComponent {
    private timerStr: string = "";
    private endTime: number = -1;
    private startTime: number = -1;
    private stopAtZero: boolean = true;
    private interval: number = -1;
    private timerOpacity: number = 0;

    get timerPreText(): string {
        return this.$store.state.textData.timerPreText;
    }

    get timerPostText(): string {
        return this.$store.state.textData.timerPostText;
    }

    @Watch("isTimerActive")
    activeChange(newState: boolean | undefined) {
        if (!newState) {
            this.timerOpacity = 0;
            clearInterval(this.interval);
        } else {
            this.timerOpacity = 1;
            this.interval = setInterval(this.timerFn.bind(this), 100);
        }
    }

    get isTimerActive(): boolean | undefined {
        return this.$store.state.isActive.timer;
    }

    formatTime(relTime: number): string {
        let remainder = relTime;
        const hrs = Math.floor(remainder);
        remainder = (remainder - hrs) * 60;
        const mins = Math.floor(remainder);
        remainder = (remainder - mins) * 60;
        const secs = Math.floor(remainder);
        remainder = (remainder - secs) * 1000;
        const mSecs = Math.floor(remainder);
        return `${hrs.toString(10).padStart(2, "0")}:${mins
            .toString(10)
            .padStart(2, "0")}:${secs.toString(10).padStart(2, "0")}`;
    }

    parseTime(time: string): number {
        const parts = time.split(":");
        if (parts.length == 1) {
            return parseInt(time, 10) * 1000;
        } else if (parts.length == 2) {
            return (
                (parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10)) * 1000
            );
        } else {
            return (
                ((parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 60 +
                    parseInt(parts[2], 10)) *
                1000
            );
        }
    }

    timerFn() {
        if (this.endTime >= 0 || this.startTime >= 0) {
            let relTime: number = 0;
            if (this.endTime >= 0) {
                relTime = (this.endTime - Date.now()) / 1000.0 / 60.0 / 60.0;
            } else {
                relTime = (Date.now() - this.startTime) / 1000.0 / 60.0 / 60.0;
            }
            if (relTime <= 0 && this.stopAtZero) {
                this.timerStr = this.$store.state.textData.timerZeroText || "";
            } else {
                this.timerStr = this.formatTime(relTime);
            }
        } else {
            this.timerStr = "";
        }
    }

    setMsg(cue: Cue): void {
        if (cue.stringKey == "timerCountToTime" && cue.value) {
            this.endTime = Date.parse(cue.value);
            if (isNaN(this.endTime)) {
                const now = new Date();
                this.endTime =
                    this.parseTime(cue.value) +
                    (now.getTime() -
                        now.getMilliseconds() -
                        now.getSeconds() * 1000 -
                        now.getMinutes() * 1000 * 60 -
                        now.getHours() * 1000 * 60 * 60);
            }
            this.startTime = -1;
            this.activeChange(true);
        } else if (cue.stringKey == "timerCountFromValue" && cue.value) {
            this.endTime = this.parseTime(cue.value) + Date.now();
            this.startTime = -1;
            this.activeChange(true);
        } else if (cue.stringKey == "timerCountUpFromNow" && cue.value) {
            this.startTime = Date.now();
            this.endTime = -1;
            this.activeChange(true);
        } else if (cue.stringKey == "timerCountUpFromTime" && cue.value) {
            this.startTime = Date.parse(cue.value);
            if (isNaN(this.startTime)) {
                const now = new Date();
                this.startTime =
                    this.parseTime(cue.value) +
                    (now.getTime() -
                        now.getMilliseconds() -
                        now.getSeconds() * 1000 -
                        now.getMinutes() * 1000 * 60 -
                        now.getHours() * 1000 * 60 * 60);
            }
            this.endTime = -1;
            this.activeChange(true);
        }
    }

    static getUsedVariables(): (
        | { name: string; description?: string }
        | string
    )[] {
        return [
            {
                name: "timer",
                description: "If set to non empty, timer is active and visible",
            },
            { name: "timerZeroText", description: "Text when timer reaches 0" },
            {
                name: "timerCountToTime",
                description: "Dest. time as parable ISO date or HH:MM:SS today",
            },
            {
                name: "timerCountFromValue",
                description: "Counts down from the given HH:MM:SS to 0",
            },
            {
                name: "timerCountUpFromNow",
                description:
                    "Starts counting up from current time, value ignored",
            },
            {
                name: "timerCountUpFromTime",
                description:
                    "Starts counting up from given iso time or HH:MM:SS",
            },
            {
                name: "timerPreText",
                description: "Text in front of time value",
            },
            { name: "timerPostText", description: "Text after time value" },
        ];
    }
}
</script>
