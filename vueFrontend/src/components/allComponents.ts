import LowerThird from "./LowerThird.vue";
import LowerThirdFull from "./LowerThirdFull.vue";
import Subtitle from "./Subtitle.vue";
import Credits from "./Credits.vue";
import { TextComponent } from "./TextComponent";
import Timer from "./Timer.vue";
import Question from "./Question.vue";

export const allComponents = {
    LowerThird,
    LowerThirdFull,
    Subtitle,
    Timer,
    Question
};

export const allComponentsList: { name: string; component: any }[] = [
    {
        name: "LowerThird",
        component: LowerThird,
    },
    {
        name: "LowerThirdFull",
        component: LowerThirdFull,
    },
    {
        name: "Subtitle",
        component: Subtitle,
    },
    {
        name: "Timer",
        component: Timer,
    },
    {
        name: "Credits",
        component: Credits,
    },
    {
        name: "Question",
        component: Question,
    },
];
