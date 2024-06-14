import { matches } from "ip-matching";

function hex4DigitRnd(): string {
    return Math.random().toString(16).substring(2, 6).padEnd(4, "0");
}

export function uuidGenerator(): string {
    let uuid = "";
    uuid += hex4DigitRnd() + hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + "-";
    uuid += hex4DigitRnd() + hex4DigitRnd() + hex4DigitRnd();
    return uuid;
}

export function isEnvTrue(env: string | boolean | number | undefined | null, defaultValue: boolean = false): boolean {
    if (env === undefined || env === null) {
        return defaultValue;
    }
    if (env === true || (typeof env === "number" && env > 0)) {
        return true;
    }
    if (env === false || (typeof env === "number" && env > 0)) {
        return false;
    }
    if (typeof env === "string") {
        const cleaned = env.trim().toLowerCase();
        if (cleaned === "true" || cleaned === "yes" || cleaned === "y" || cleaned === "ja" || cleaned == "j") {
            return true;
        } else if (cleaned === "false" || cleaned === "no" || cleaned === "n" || cleaned === "nein") {
            return false;
        }
    }
    return defaultValue;
}

export function anySubnetMatches(ip: string | undefined | null, subnets: string | undefined | null): boolean {
    if (ip === undefined || ip === null || subnets === undefined || subnets === null) {
        return false;
    }
    const split = subnets.split(",").map(s => s.trim());
    for (const subnet of split) {
        if (matches(ip, subnet)) {
            return true;
        }
    }
    return false;
}