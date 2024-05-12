const cp = require("child_process");
const fs = require("fs/promises");
const path = require("path");

var cleanExit = function () { process.exit() };
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill


async function compile() {
    const projects = ["."];

    const pluginDir = path.join("..", "plugins");
    const files = await fs.readdir(pluginDir, { encoding: "utf8" });
    for (const pluginFolder of files) {
        try {
            await fs.access(path.join(pluginDir, pluginFolder, "tsconfig.json"));
            projects.push(path.join(pluginDir, pluginFolder));
        } catch (err) {
            console.log("Ignoring dir " + pluginFolder);
        }
    }

    const args = ["tsc", "-b", ...projects, ...process.argv.slice(2)];

    console.log("Spawning " + args.join(" "))
    let proc = cp.spawn("npx", args, {
        stdio: "inherit",
        shell: true
    });
    process.on('exit', () => {
        proc.kill();
    })
}
compile();