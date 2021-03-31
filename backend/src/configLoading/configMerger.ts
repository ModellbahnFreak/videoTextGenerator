import { Config } from "./Config";

export function configMerger(configs: Config[]): Config {
    const config: Config = {
        cuelists: configs
            .map((c) => c.cuelists)
            .reduce((prev, curr) => prev.concat(curr), []),
    };
    return config;
}
