import { FrontendAPI } from "@/FrontendAPI";
import type { FrontendPlugin } from "@videotextgenerator/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface PluginWithMetadata {
    plugin: FrontendPlugin;
    folderName: string;
    api: FrontendAPI;
}

export const usePluginStore = defineStore('plugin', () => {
    const pluginFolderNameToUuid = ref<{ [folderName: string]: string }>({});
    const pluginsByUuid = ref<{ [uuid: string]: PluginWithMetadata }>({});

    function addPlugin(pluginPath: string, plugin: FrontendPlugin, api: FrontendAPI) {
        const folderName = pluginPath.match(/plugins\/([\w\- ]+)\/frontend\/index/)
        if (!folderName) {
            throw new Error(`Incompatible path to plugin: ${pluginPath}`);
        }
        if (!pluginsByUuid.value[plugin.uuid]) {
            pluginsByUuid.value[plugin.uuid] = {
                plugin, api,
                folderName: folderName[1],
            };
            pluginFolderNameToUuid.value[folderName[1]] = plugin.uuid;
            console.log(`Added plugin ${folderName[1]}, ${plugin.uuid}`);
        }
    }

    function hasPlugin(pluginPath: string): boolean {
        const folderName = pluginPath.match(/plugins\/([\w\- ])+\/frontend\/index/)
        if (!folderName) {
            throw new Error(`Incompatible path to plugin: ${pluginPath}`);
        }
        return !!pluginFolderNameToUuid.value[folderName[1]];
    }

    return { pluginFolderNameToUuid, pluginsByUuid, addPlugin, hasPlugin };
});