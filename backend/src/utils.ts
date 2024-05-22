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