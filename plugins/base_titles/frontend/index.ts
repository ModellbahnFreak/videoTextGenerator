import type { APIBase, FrontendPlugin } from "@videotextgenerator/api";

class BaseTitlesPluginFrontend implements FrontendPlugin {
    public readonly pluginName = "Base Titles Plugin";
    public readonly uuid: string = "7c7e723b-452f-49ec-bde0-a6977c1dfb63";

    public run(api: APIBase) { }

    getGraphicComponents() {
        return [
            { title: "Lower Third", component: () => import("./graphic/LowerThird.vue") }
        ]
    }
    getEditorComponents() {
        return [
            { title: "Title Editor", component: () => import("./editor/TitleEditor.vue") }
        ];
    }
}
export default new BaseTitlesPluginFrontend();

export interface LowerThirdDataKey {
    isActive: boolean,
    text: string,
    subtitle: string,
    logoUrl: string
}