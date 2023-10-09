import { Plugin } from "./Plugin";
import * as zmq from "zeromq";

export interface ZMQConfig {
    zmq_url: string,
    zmq_output_format: string | undefined,
    zmq_sub_topic: string | undefined
}

export class ZMQInputPlugin extends Plugin<ZMQConfig> {
    private sock: zmq.Subscriber | undefined;

    public init(): void {
        if (this.config == undefined) {
            throw new Error("ZMQ Config not loaded");
        }

        this.sock = new zmq.Subscriber();
        this.sock.connect(this.config?.zmq_url);
        this.sock.subscribe(this.config.zmq_sub_topic ?? ""); // empty string => all topics

        const formatStr = this.config.zmq_output_format || "$*";

        (async () => {
            for await (const [msg] of this.sock!) {
                let msgStr = msg.subarray(3).toString("utf8");
                msgStr = msgStr.substring(0, msgStr.length - 1);
                const lines = msgStr.split(";");
                console.log("Received ZMQ message")
                if (lines[0].trim() == "" && lines[1].trim() == "") {
                    this.clearAll();
                } else {
                    let dataStr = formatStr.replace(/\$\*/g, msgStr);
                    const allChars = formatStr.match(/\$l?[0-9]+/g);
                    for (const chr of allChars ?? []) {
                        if (chr.charAt(1) == "l") {
                            const index = parseInt(chr.substring(2), 10);
                            dataStr = dataStr.replace(chr, lines[index]);
                        } else {
                            const index = parseInt(chr.substring(1), 10);
                            dataStr = dataStr.replace(chr, msgStr.charAt(index));
                        }
                    }

                    const rangeRegex = /\$\{([0-9]+),(\-?[0-9]*)\}/g;
                    let rangeMatch = rangeRegex.exec(dataStr);
                    while (rangeMatch != null) {
                        const start = parseInt(rangeMatch[1], 10)
                        const end = parseInt(rangeMatch[2], 10);
                        if (!isFinite(end) || rangeMatch[2] == "-" || rangeMatch[2] == "") {
                            dataStr = dataStr.replace(rangeMatch[0], msgStr.substring(start));
                        } else {
                            dataStr = dataStr.replace(rangeMatch[0], msgStr.substring(start, end));
                        }
                        rangeMatch = rangeRegex.exec(dataStr);
                    }

                    this.setSingle("lowerThird", dataStr);
                }
            }
        }).bind(this)();
    }

}

const zmqPluginInstance = new ZMQInputPlugin();
export default zmqPluginInstance;