import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path"

export function loadConfigAndMerge<ConfigType>(name: string): ConfigType {
    const allConfs = configLoader<ConfigType>(name);
    if (allConfs.length == 0) {
        throw new Error("No config file for " + name);
    }
    let merged: ConfigType = allConfs[0];
    for (let i = 1; i < allConfs.length; i++) {
        merged = {
            ...merged,
            ...allConfs[i]
        }
    }
    return merged;
}

export function configLoader<ConfigType>(name?: string): ConfigType[] {
    const ajv = new Ajv();
    const validator = ajv.compile(
        JSON.parse(fs.readFileSync(path.normalize(path.join("config", name ?? ".", `${name ?? "config"}.schema.json`)), "utf8"))
    );
    const files = fs.readdirSync(path.normalize(path.join("config", name ?? ".")));
    return files
        .filter((f) => f.endsWith(".json") && !f.endsWith(".schema.json"))
        .map((f) => {
            const config = JSON.parse(
                fs.readFileSync(path.normalize(path.join("config", name ?? ".", f)), "utf8")
            ) as ConfigType;
            if (!validator(config)) {
                console.error(`Illegal config:`, validator.errors);
                return { config, success: false };
            }
            return { config, success: true };
        })
        .filter((c) => c.success)
        .map((c) => c.config);
}
