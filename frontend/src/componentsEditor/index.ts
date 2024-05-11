import type { APIBase, FrontendPlugin, NamedComponent } from "@videotextgenerator/api";

class IncludedEditorsComponents implements FrontendPlugin {
    public readonly pluginName = "Included Editors";
    public readonly uuid = "IncludedEditors"

    getGraphicComponents(): NamedComponent[] {
        return [];
    }
    getEditorComponents(): NamedComponent[] {
        return [
            { title: "Commandline", component: () => import("./commandline.vue") },
        ]
    }
    run(api: APIBase): void {
    }

}

export default new IncludedEditorsComponents();