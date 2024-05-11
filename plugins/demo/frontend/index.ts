import { APIBase, FrontendPlugin } from "@videotextgenerator/api";
import { DemoPluginBase } from "../common/DemoPluginBase";

class DemoPluginFrontend extends DemoPluginBase implements FrontendPlugin {
    protected _api: APIBase | undefined = undefined;

    run(api: APIBase): void {
        this._api = api;
    }

    getGraphicComponents() {
        return [
            { title: "Demo Graphic", component: () => import("./graphic/demo.vue") }
        ]
    }
    getEditorComponents() {
        return [];
    }

    get api(): APIBase | undefined { return this._api }
}
export default new DemoPluginFrontend();