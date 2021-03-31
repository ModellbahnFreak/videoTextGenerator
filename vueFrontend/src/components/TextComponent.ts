import { Cue } from "@/Config";

export interface TextComponent extends Vue {
    setMsg(cue: Cue): void;
}
