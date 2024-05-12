import { DemoPluginBase } from "../common/DemoPluginBase";
import type { APIBase, BackendPlugin } from "@videotextgenerator/api";

console.log("Demo plugin was loaded!");

class DemoPluginBackend extends DemoPluginBase implements BackendPlugin {
    run(api: APIBase): void {
        super.run(api);
        console.log("Backend demo plugin run!");
    }

}