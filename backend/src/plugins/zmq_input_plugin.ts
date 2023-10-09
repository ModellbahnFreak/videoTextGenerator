import { Plugin } from "./plugin";
import * as zmq from "zeromq";

export class ZMQInputPlugin extends Plugin {
    private sock: zmq.Subscriber | undefined;

    public init(): void {
        this.sock = new zmq.Subscriber();
        this.sock.connect("tcp://127.0.0.1:2000");
        this.sock.subscribe(""); // all topics

        (async () => {
            for await (const [msg] of this.sock!) {
                let msgStr = msg.subarray(3).toString("utf8");
                msgStr = msgStr.substring(0, msgStr.length - 1);
                const lines = msgStr.split(";");
                console.log("Received ZMQ message")
                if (lines[0].trim() == "" && lines[1].trim() == "") {
                    this.clearAll();
                } else {
                    this.setSingle("lowerThird", "GL " + lines[0] + " &nbsp; " + lines[1].replace(/([+\-])/g, " $1 "))
                }
            }
        }).bind(this)();
    }

}