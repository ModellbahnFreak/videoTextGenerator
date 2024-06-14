import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useClientConfigStore } from './clientConfig';

export interface ComponentMetadata {
    indexInPlugin: number;
    isOpened: boolean;
    pluginUuid: string;
    title: string
}

/**
 * Store that handles loading of vue components as well as managing the state (visible/order etc.) for each client
 */
export const useComponentStore = defineStore('client', () => {
    const clientConfigStore = useClientConfigStore();
    const editors = clientConfigStore.getConfigKeyOrInitialize<ComponentMetadata[]>("editors", []);

    const graphics = clientConfigStore.getConfigKeyOrInitialize<ComponentMetadata[]>("graphics", []);

    function editorAdd(pluginUuid: string, indexInPlugin: number, title: string) {
        if (editors.filter(c => c.pluginUuid == pluginUuid && c.indexInPlugin == indexInPlugin).length > 0) {
            return;
        }
        editors.push({ indexInPlugin, isOpened: true, pluginUuid, title });
    }
    function editorSetOpened(i: number, isOpened: boolean) {
        const editor = editors[i];
        if (editor) {
            editor.isOpened = isOpened;
        }
        clientConfigStore.storeAndSendConfig();
    }

    function graphicsAdd(pluginUuid: string, indexInPlugin: number, title: string) {
        if (graphics.filter(c => c.pluginUuid == pluginUuid && c.indexInPlugin == indexInPlugin).length > 0) {
            return;
        }
        graphics.push({ indexInPlugin, isOpened: true, pluginUuid, title });
    }
    function graphicsSetOpened(i: number, isOpened: boolean) {
        const graphic = graphics[i];
        if (graphic) {
            graphic.isOpened = isOpened;
        }
        clientConfigStore.storeAndSendConfig();
    }

    return { editors, graphics, editorAdd, editorSetOpened, graphicsAdd, graphicsSetOpened }
})
