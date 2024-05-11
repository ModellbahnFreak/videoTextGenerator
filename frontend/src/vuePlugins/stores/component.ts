import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PluginData } from '@videotextgenerator/api';

export const useComponentStore = defineStore('client', () => {
    const editors = ref<{ path: string, isOpened: boolean, data?: PluginData }[]>([]);

    const graphics = ref<{ indexInPlugin: number, isOpened: boolean, pluginUuid: string, title: string }[]>([]);

    function editorAdd(path: string) {
        if (editors.value.filter(e => e.path == path).length > 0) {
            return;
        }
        editors.value.push({ path, isOpened: false, data: {} });
    }
    function editorSetOpened(i: number, isOpened: boolean) {
        const editor = editors.value[i];
        if (editor) {
            editor.isOpened = isOpened;
        }
    }
    function editorSetData(i: number, data: PluginData) {
        const editor = editors.value[i];
        if (editor) {
            editor.data = data;
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

    return { editors, graphics, editorAdd, editorSetData, editorSetOpened, graphicsAdd, graphicsSetOpened }
})
