import { Config } from "./Config";

export function configMerger(configs: Config[]): Config {
    const config: Config = {
        cuelists: configs
            .map((c) => c.cuelists)
            .reduce((prev, curr) => prev.concat(curr), []),
        plugins: {
            blacklist: configs.map(c => c.plugins?.blacklist).reduce((prev, curr) => (prev ?? []).concat(curr ?? []), []),
        }
    };
    for (const c of configs) {
        for (const key in c) {
            if (key == "plugins") {
                for (const pluginKey in c.plugins) {
                    if (pluginKey != "blacklist" && Object.prototype.hasOwnProperty.call(c.plugins, pluginKey)) {
                        (config.plugins as any)[pluginKey] = (c.plugins as any)[pluginKey];
                    }
                }
            } else if (key != "cuelists" && Object.prototype.hasOwnProperty.call(c, key)) {
                (config as any)[key] = (c as any)[key];
            }
        }
    }
    return config;
}
