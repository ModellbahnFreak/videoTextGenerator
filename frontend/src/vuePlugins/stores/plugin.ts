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

    function addPlugin(folderName: string, plugin: FrontendPlugin, api: FrontendAPI) {
        if (!pluginsByUuid.value[plugin.uuid]) {
            pluginsByUuid.value[plugin.uuid] = {
                plugin, api,
                folderName: folderName,
            };
            pluginFolderNameToUuid.value[folderName] = plugin.uuid;
            console.log(`Added plugin ${folderName}, ${plugin.uuid}`);
        }
    }

    function hasPlugin(folderName: string): boolean {
        return !!pluginFolderNameToUuid.value[folderName];
    }

    return { pluginFolderNameToUuid, pluginsByUuid, addPlugin, hasPlugin };
});