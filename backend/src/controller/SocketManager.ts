import { IncomingMessage } from "http";
import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { ClientSocket } from "./ClientSocket.js";
import { uuidGenerator } from "../utils.js";

export class SocketManager {

    public readonly server: WebSocketServer;

    protected clientSockets: Map<string, ClientSocket> = new Map();

    constructor(
        webSocketServerOrOptions?: WebSocketServer | ServerOptions
    ) {
        if (webSocketServerOrOptions && webSocketServerOrOptions instanceof WebSocketServer) {
            this.server = webSocketServerOrOptions;
        } else {
            const addOptions = webSocketServerOrOptions ? webSocketServerOrOptions : {};
            this.server = new WebSocketServer({
                path: "/api",
                ...addOptions
            });
        }
        this.server.on("connection", this.onConnection.bind(this));
        this.server.on("error", this.onError.bind(this));
    }

    protected onConnection(socket: WebSocket, request: IncomingMessage) {
        this.checkOpenSockets();
        const uuid = uuidGenerator();
        this.clientSockets.set(uuid, new ClientSocket(socket, uuid));
    }

    protected onError(error: Error) {
        throw error;
    }

    protected checkOpenSockets() {
        for (const [socketId, socket] of this.clientSockets) {
            if (!socket.isConnected) {
                socket.close();
                this.clientSockets.delete(socketId);
            }
        }
    }
}