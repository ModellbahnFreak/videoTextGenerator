import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
    const editors = ref<ComponentMetadata[]>([]);

    const graphics = ref<ComponentMetadata[]>([]);

    function editorAdd(pluginUuid: string, indexInPlugin: number, title: string) {
        if (editors.value.filter(c => c.pluginUuid == pluginUuid && c.indexInPlugin == indexInPlugin).length > 0) {
            return;
        }
        editors.value.push({ indexInPlugin, isOpened: true, pluginUuid, title });
    }
    function editorSetOpened(i: number, isOpened: boolean) {
        const editor = editors.value[i];
        if (editor) {
            editor.isOpened = isOpened;
        }
    }

    function graphicsAdd(pluginUuid: string, indexInPlugin: number, title: string) {
        if (graphics.value.filter(c => c.pluginUuid == pluginUuid && c.indexInPlugin == indexInPlugin).length > 0) {
            return;
        }
        graphics.value.push({ indexInPlugin, isOpened: true, pluginUuid, title });
    }
    function graphicsSetOpened(i: number, isOpened: boolean) {
        const graphic = graphics.value[i];
        if (graphic) {
            graphic.isOpened = isOpened;
        }
    }

    return { editors, graphics, editorAdd, editorSetOpened, graphicsAdd, graphicsSetOpened }
})
