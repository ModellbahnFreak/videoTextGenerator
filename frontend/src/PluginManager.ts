import type { FrontendPlugin } from "@videotextgenerator/api";
import { usePluginStore } from "./vuePlugins/stores/plugin";
import { FrontendAPI } from "./FrontendAPI";
import { defineAsyncComponent, type AsyncComponentLoader } from "vue";
import { useComponentStore } from "./vuePlugins/stores/component";
import { useDataKeyStore } from "./vuePlugins/stores/dataKey";

export async function loadPlugins(): Promise<void> {

    const pluginStore = usePluginStore();
    const dataKeyStore = useDataKeyStore();

    const plugins = import.meta.glob([
        "@/componentsGraphic/index.ts", "@/componentsEditor/index.ts",
        "@plugins/*/frontend/index.ts", "@plugins/*/frontend/index.js"
    ], { import: "default" });

    console.log("Found plugins: ", plugins);

    for (const pluginPath in plugins) {
        const isIncluded = pluginPath.match(/^\/src\/(componentsGraphic|componentsEditor)\/index.ts$/);
        const folderName = isIncluded ? "/included" : (pluginPath.match(/plugins\/([\w\- ]+)\/frontend\/index/) ?? [])[1];
        if (!folderName) {
            throw new Error(`Incompatible path to plugin: ${pluginPath}`);
        }

        if (Object.prototype.hasOwnProperty.call(plugins, pluginPath)) {
            const pluginLoader = plugins[pluginPath];
            if (!pluginStore.hasPlugin(pluginPath)) {
                const plugin = await pluginLoader() as FrontendPlugin;
                if (!plugin?.uuid || (!isIncluded && !plugin.uuid?.match(/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/))) {
                    console.error(pluginPath + " is not a plugin or uuid is invalid. Ignoring import.");
                    continue;
                }
                pluginStore.addPlugin(folderName, plugin, new FrontendAPI(plugin.uuid, dataKeyStore));
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

export function loadGraphicsComponentsFor(pluginUuid: string, pluginStore = usePluginStore(), componentStore = useComponentStore()): ReturnType<typeof defineAsyncComponent>[] {
    const plugin = pluginStore.pluginsByUuid[pluginUuid];
    return plugin.plugin.getGraphicComponents().map((component, i) => {
        componentStore.graphicsAdd(pluginUuid, i, component.title);

        return typeof component.component == "function"
            ? defineAsyncComponent(component.component as AsyncComponentLoader)
            : defineAsyncComponent((() => Promise.resolve(component.component)) as AsyncComponentLoader)
    });
}

export function loadAllGraphicsComponents(pluginStore = usePluginStore(), componentStore = useComponentStore()): { [pluginUuid: string]: ReturnType<typeof loadGraphicsComponentsFor> } {
    return Object.fromEntries(
        Object.keys(pluginStore.pluginsByUuid)
            .map(uuid => [uuid, loadGraphicsComponentsFor(uuid, pluginStore, componentStore)])
    );
}

export function loadEditorComponentsFor(pluginUuid: string, pluginStore = usePluginStore(), componentStore = useComponentStore()): ReturnType<typeof defineAsyncComponent>[] {
    const plugin = pluginStore.pluginsByUuid[pluginUuid];
    return plugin.plugin.getEditorComponents().map((component, i) => {
        componentStore.editorAdd(pluginUuid, i, component.title);

        return typeof component.component == "function"
            ? defineAsyncComponent(component.component as AsyncComponentLoader)
            : defineAsyncComponent((() => Promise.resolve(component.component)) as AsyncComponentLoader)
    });
}

export function loadAllEditorComponents(pluginStore = usePluginStore(), componentStore = useComponentStore()): { [pluginUuid: string]: ReturnType<typeof loadGraphicsComponentsFor> } {
    return Object.fromEntries(
        Object.keys(pluginStore.pluginsByUuid)
            .map(uuid => [uuid, loadEditorComponentsFor(uuid, pluginStore, componentStore)])
    );
}