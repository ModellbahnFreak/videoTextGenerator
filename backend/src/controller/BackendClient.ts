import { ClientSocket } from "./ClientSocket.js";

export class BackendClient {
    protected readonly sockets: Map<string, ClientSocket> = new Map();

    constructor() {

    }

    dataKey(topic: string, dataKey: string, value: string);

    addSocket(socket: ClientSocket) {
        this.sockets.set(socket.uuid, socket);
    }

    removeSocket(socket: ClientSocket) {
        this.sockets.delete(socket.uuid);
    }

}