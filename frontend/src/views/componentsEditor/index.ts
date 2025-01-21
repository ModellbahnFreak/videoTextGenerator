import type { APIBase, FrontendPlugin, NamedComponent } from "@videotextgenerator/api";

class IncludedEditorsComponents implements FrontendPlugin {
    public readonly pluginName = "Included Editors";
    public readonly uuid = "IncludedEditors";

    public run(api: APIBase) { }

    getGraphicComponents(): NamedComponent[] {
        return [];
    }
    getEditorComponents(): NamedComponent[] {
        return [
            { title: "Commandline", component: () => import("./commandline.vue") },
        ]
    }
}

export default new IncludedEditorsComponents();