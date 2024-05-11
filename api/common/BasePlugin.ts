import { APIBase } from "./APIBase";

export interface BasePlugin {
    readonly pluginName?: string;
    readonly uuid: string;

    run(api: APIBase): void;
}