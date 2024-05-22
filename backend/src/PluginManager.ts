import type { BackendPlugin } from "@videotextgenerator/api";
import * as fs from "fs/promises";
import * as path from "path";
import * as url from "url";
import { BackendAPI } from "./controller/BackendAPI.js";

export interface PluginWithMetadata {
    plugin: BackendPlugin;
    folderName: string;
    api: BackendAPI;
}

export class PluginManager {

    protected readonly pluginsByUuid: Map<string, PluginWithMetadata> = new Map();

    constructor() { }

    protected createApiFor(plugin: BackendPlugin): BackendAPI {
        return new BackendAPI(plugin.uuid);
    }

    async loadPlugins(): Promise<void> {
        const allFolders = await fs.readdir(path.join(__dirname, "..", "..", "plugins"), { encoding: "utf8", withFileTypes: true });
        for (const pluginFolder of allFolders) {
            if (pluginFolder.isCharacterDevice() || pluginFolder.isFIFO() || pluginFolder.isFile() || pluginFolder.isSocket()) {
                continue;
            }
            const fullPath = path.join(pluginFolder.parentPath ?? pluginFolder.path, pluginFolder.name);
            let indexPath: string | undefined = undefined;
            try {
                const pkgJson = JSON.parse(await fs.readFile(path.join(fullPath, "package.json"), { encoding: "utf-8" }));
                if (pkgJson.exports) {
                    const backendEntries = Object.entries(pkgJson.exports).filter(exp => !!exp[0].match(/^(\.\/)backend$/));
                    if (backendEntries.length > 0) {
                        const filePath = backendEntries[0][1] as string;
                        if (path.isAbsolute(filePath)) {
                            indexPath = filePath;
                        } else {
                            indexPath = path.join(fullPath, filePath);
                        }
                        await fs.access(indexPath);
                    }
                }
            } catch (err) {
                console.warn("Ignoring plugin " + pluginFolder.name);
                indexPath = undefined;
            }
            if (!indexPath) {
                try {
                    indexPath = path.join(fullPath, "backend", "index.js");
                    await fs.access(indexPath);
                } catch (err) {
                    indexPath = undefined;
                    try {
                        indexPath = path.join(fullPath, "out", "backend", "index.js");
                        await fs.access(indexPath);
                    } catch (err) {
                        indexPath = undefined;
                    }
                }
            }
            if (!indexPath) {
                console.log(`Ignoring plugin folder ${pluginFolder.name}. No importable index found.`);
                continue;
            }
            console.log("Found plugin ", indexPath);
            const plugin = (await import(url.pathToFileURL(indexPath).toString()))?.default as (BackendPlugin | undefined);
            if (!plugin) {
                console.log(`Ignoring plugin folder ${pluginFolder.name}. Has no default export.`);
                continue;
            }
            console.log(plugin);
            this.pluginsByUuid.set(plugin.uuid, {
                plugin, folderName: pluginFolder.name, api: this.createApiFor(plugin),
            });
        }
    }
}