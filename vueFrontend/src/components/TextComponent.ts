import { Cue } from "@/Config";

export interface TextComponent extends Vue {
    setMsg(cue: Cue): void;
    //static getUsedVariables(): ({ name: string; description?: string } | string)[];
}
