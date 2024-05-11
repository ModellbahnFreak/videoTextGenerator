import { BasePlugin } from "../common/BasePlugin";

type Component = {};
type LazyOrImmediateComponent = Component | (() => Promise<Component>);

export interface NamedComponent {
    title: string;
    component: LazyOrImmediateComponent;
}


export interface FrontendPlugin extends BasePlugin {
    getGraphicComponents(): NamedComponent[];
    getEditorComponents(): NamedComponent[];
}