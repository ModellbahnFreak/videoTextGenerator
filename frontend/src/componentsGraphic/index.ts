import type { APIBase, FrontendPlugin, NamedComponent } from "@videotextgenerator/api";

class IncludedGraphicsComponents implements FrontendPlugin {
    public readonly pluginName = "Included Graphics";
    public readonly uuid = "IncludedGraphics"

    getGraphicComponents(): NamedComponent[] {
        return [
            { title: "Test Graphics 1", component: () => import("./test.vue") },
            { title: "Test Graphics 2", component: () => import("./test2.vue") }
        ]
    }
    getEditorComponents(): NamedComponent[] {
        return [];
    }
    run(api: APIBase): void {
    }

}

export default new IncludedGraphicsComponents();