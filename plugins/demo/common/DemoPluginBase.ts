import type { APIBase, BasePlugin } from "@videotextgenerator/api";

export class DemoPluginBase implements BasePlugin {
    public readonly pluginName = "Demo Plugin";
    public readonly uuid: string = "7d5cb01a-2913-4d01-a150-91884272cf58";

    protected _api: APIBase | undefined = undefined;

    run(api: APIBase): void {
        this._api = api;
    }
}