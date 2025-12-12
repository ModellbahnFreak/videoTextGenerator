import express from "express";
import * as fs from "fs/promises";
import { PluginManager } from "./pluginManagement/PluginManager.js";
import path from "path";

type FileStructure = { type: "file" };
type FolderStructure = { type: "folder", content: { [name: string]: FolderStructure | FileStructure } };

async function getFilesFrom(dir: string): Promise<FolderStructure> {
    let folder: FolderStructure = { type: "folder", content: {} };
    for (const element of await fs.readdir(dir, { encoding: "utf8", withFileTypes: true })) {
        if (element.isFile()) {
            folder.content[element.name] = { type: "file" };
        } else if (element.isDirectory()) {
            folder.content[element.name] = await getFilesFrom(path.join(dir, element.name));
        }
    }
    return folder;
}

// todo: provide (auto updating) file list to clients

export function staticServer(pluginMgr: PluginManager): (req: express.Request, res: express.Response, next: express.NextFunction) => void {

    return async (req, res, next) => {
        const pluginPath = pluginMgr.getPathOfPlugin(req.params.pluginUuid);
        if (!pluginPath) {
            res.status(404).json({ code: 404, msg: `No plugin with uuid ${req.params.pluginUuid}` });
            return;
        }
        const staticPath = path.join(pluginPath, "static");
        req.url = "/" + req.params.filepath;
        console.log("Serving static", req.url, "from", staticPath)
        express.static(staticPath, { fallthrough: false })(req, res, next)
    }
}