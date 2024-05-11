import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PluginData } from '@videotextgenerator/api';

export const useClientStore = defineStore('client', () => {
    const editors = ref<{ path: string, isOpened: boolean, data?: PluginData }[]>([]);

    const graphics = ref<{ path: string, isOpened: boolean, data?: PluginData }[]>([]);

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

    function graphicsAdd(path: string) {
        if (graphics.value.filter(p => p.path == path).length > 0) {
            return;
        }
        graphics.value.push({ path, isOpened: true, data: {} });
    }
    function graphicsSetOpened(i: number, isOpened: boolean) {
        const graphic = graphics.value[i];
        if (graphic) {
            graphic.isOpened = isOpened;
        }
    }
    function graphicsSetData(i: number, data: PluginData) {
        const graphic = graphics.value[i];
        if (graphic) {
            graphic.data = data;
        }
    }

    return { editors, graphics, editorAdd, editorSetData, editorSetOpened, graphicsAdd, graphicsSetData, graphicsSetOpened }
})
