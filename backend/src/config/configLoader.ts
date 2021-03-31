import Ajv from "ajv";
import * as fs from "fs";

export function configLoader<ConfigType>(name: string): ConfigType[] {
    const ajv = new Ajv();
    const validator = ajv.compile(
        JSON.parse(fs.readFileSync(`${name}/${name}.schema.json`, "utf8"))
    );
    const files = fs.readdirSync(name);
    return files
        .filter((f) => f.endsWith(".json") && !f.endsWith(".schema.json"))
        .map((f) => {
            const config = JSON.parse(
                fs.readFileSync(`${name}/${f}`, "utf8")
            ) as ConfigType;
            if (!validator(config)) {
                throw new Error(
                    `Illegal config: ${JSON.stringify(validator.errors)}`
                );
            }
            return config;
        });
}
