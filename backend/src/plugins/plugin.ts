import { loadConfigAndMerge } from "../configLoading/configLoader";
import * as fs from "fs/promises";
import * as path from "path";
import { Dirent } from "fs";
import { Cue } from "../configLoading/Config";

export abstract class Plugin<ConfigType> {
    protected config: ConfigType | undefined = undefined;

    protected abstract init(): void;

    /**
     * 
     * @param stringKey The string key on which the cue is set
     * @param cue The list of actions to set in this cue
     * @returns A new list of cues (replaces the old one), `undefined` to let the message pass or `false` to don't publish the message
     */
    public onCueSet(stringKey: string, cue: Cue[]): Cue[] | undefined | void | false {
        return undefined;
    }

    public onClearAll(): undefined | void | false {
        return undefined;
    }

    public reloadConfig() {
        this.config = loadConfigAndMerge<ConfigType>(this.constructor.name);
    }

    public startPlugin() {
        this.reloadConfig();
        this.init();
    }

    public onSendMessage: (msg: any) => void = () => { };
    protected clearAll() {
        this.onSendMessage({
            type: "clearAll"
        });
    }

    protected setSingle(field: string, value: string) {
        this.onSendMessage({
            type: "set",
            stringKey: field,
            cue: [
                {
                    value
                }
            ],
        });
    }
}

async function loadFileIfPlugin(blacklist: string[], dirname: string, file: Dirent): Promise<Plugin<any> | null> {
    try {
        const absolutePath = path.normalize(path.join(dirname, file.name));
        const extensionStart = file.name.lastIndexOf(".");
        const pluginName = file.name.substring(0, extensionStart >= 0 ? extensionStart : file.name.length);

        if (absolutePath == __filename) {
            return null;
        }
        if (!((file.isFile() || file.isSymbolicLink()) && file.name.endsWith(".js")) && !(file.isDirectory())) {
            return null;
        }
        if (blacklist.includes(pluginName)) {
            console.log(`Not loading ${file.name} as its blacklisted`);
            return null;
        }
        console.log(`Trying to import ${file.name}`);
        const plugin = await import(absolutePath);
        if (plugin?.default && plugin?.default instanceof Plugin) {
            console.log(`Successfully loaded plugin ${plugin.default.constructor.name}`);
            return plugin.default;
        } else {
            console.log(`Not loading ${file.name} as it doesn't default export a plugin instance`);
        }
    } catch (err: any) {
        console.log(`Could not load plugin ${file.name}. Error: ${err?.message}`);
        console.error(err);
    }
    return null;
}

export async function loadAllPlugins(blacklist?: string[]): Promise<Plugin<any>[]> {
    const plugins = await Promise.all(
        (await fs.readdir(__dirname, { withFileTypes: true })).map(loadFileIfPlugin.bind(null, blacklist ?? [], __dirname))
    );
    return plugins.filter(p => p != null) as (Plugin<any>[]);
}