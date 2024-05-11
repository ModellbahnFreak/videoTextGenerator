import type { FrontendPlugin } from "@videotextgenerator/api";
import { usePluginStore } from "./vuePlugins/stores/plugin";
import { FrontendAPI } from "./FrontendAPI";
import { pl } from "vuetify/locale";

export async function loadPlugins(): Promise<void> {

    const pluginStore = usePluginStore();

    const plugins = import.meta.glob(["@plugins/*/frontend/index.ts", "@plugins/*/frontend/index.js"], { import: "default" });

    console.log("Found plugins: ", plugins);

    for (const pluginPath in plugins) {
        if (Object.prototype.hasOwnProperty.call(plugins, pluginPath)) {
            const pluginLoader = plugins[pluginPath];
            if (!pluginStore.hasPlugin(pluginPath)) {
                const plugin = await pluginLoader() as FrontendPlugin;
                if (!plugin?.uuid || !plugin.uuid?.match(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/)) {
                    console.error(pluginPath + " is not a plugin or uuid is invalid. Ignoring import.");
                    continue;
                }
                pluginStore.addPlugin(pluginPath, plugin, new FrontendAPI(plugin.uuid));
            }
        }
    }

    for (const uuid in pluginStore.pluginsByUuid) {
        if (Object.prototype.hasOwnProperty.call(pluginStore.pluginsByUuid, uuid)) {
            const plugin = pluginStore.pluginsByUuid[uuid];
            plugin.plugin.run(plugin.api);
        }
    }

}