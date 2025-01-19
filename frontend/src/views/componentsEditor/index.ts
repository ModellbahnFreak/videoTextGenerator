import type { APIBase, FrontendPlugin, NamedComponent } from "@videotextgenerator/api";

class IncludedEditorsComponents implements FrontendPlugin {
    public readonly pluginName = "Included Editors";
    public readonly uuid = "IncludedEditors";

    // Allows awaiting "api" from the components in case it gets injected after the plugin is loaded
    public api: Promise<APIBase> = new Promise((resolve, reject) => this.run = resolve);
    public run = (api: APIBase) => { this.api = Promise.resolve(api) };

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