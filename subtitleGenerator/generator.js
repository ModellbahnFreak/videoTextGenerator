const fs = require("fs");

const input = fs.readFileSync("input.txt", "utf-8");
const lines = input.split("\n");
let lastSubtitleA = true;
let lineCounter = -1;
const out = lines.map((l) => {
    lastSubtitleA = !lastSubtitleA;
    lineCounter++;
    if (lastSubtitleA) {
        return {
            name: "Line" + lineCounter,
            stringKey: "subtitleB",
            value: l.trim(),
        };
    } else {
        return {
            name: "Line" + lineCounter,
            stringKey: "subtitleA",
            value: l.trim(),
        };
    }
});

fs.writeFileSync(
    "output.json",
    JSON.stringify(
        [
            {
                name: "Clear",
                isActive: false,
            },
            {
                name: "Show",
            },
            ...out,
        ],
        undefined,
        4
    ),
    {
        encoding: "utf-8",
    }
);
