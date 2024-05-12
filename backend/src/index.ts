import * as fs from "fs/promises";
import * as path from "path";
import * as url from "url";

console.log("Backend Index");

async function loadPlugins() {
    const allPlugins = await fs.readdir(path.join(__dirname, "..", "..", "plugins"), { encoding: "utf8", withFileTypes: true });
    for (const pluginFolder of allPlugins) {
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
                indexPath = path.join(fullPath, "frontend", "index.js");
                await fs.access(indexPath);
            } catch (err) {
                indexPath = undefined;
                try {
                    indexPath = path.join(fullPath, "out", "frontend", "index.js");
                    await fs.access(indexPath);
                } catch (err) {
                    indexPath = undefined;
                }
            }
        }
        if (indexPath) {
            console.log("Found plugin ", indexPath);
            const plugin = await import(url.pathToFileURL(indexPath).toString());
            console.log(plugin);
        } else {
            console.log(`Ignoring plugin folder ${pluginFolder.name}. No importable index found.`);
        }
    }
    console.log("End")
}

loadPlugins();
