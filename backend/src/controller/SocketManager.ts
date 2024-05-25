import { IncomingMessage } from "http";
import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { ClientSocket } from "./ClientSocket.js";
import { uuidGenerator } from "../utils.js";
import { ClientManager } from "./CientManager.js";

/**
 * Class responsible for managing the WebSocketServer
 * 
 * It handles new connections and dispateches them to an instance of ClientSocket each.
 * It keeps track of existing ClientSockets
 */
export class SocketManager {

    public readonly server: WebSocketServer;

    protected clientSockets: Map<string, ClientSocket> = new Map();
    protected closedWatcher: ReturnType<typeof setInterval>;
    readonly clientManager: ClientManager;

    constructor(
        protected readonly serverUuid: string,
        webSocketServerOrOptions?: WebSocketServer | ServerOptions,
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

        this.closedWatcher = setInterval(this.checkOpenSockets.bind(this), 1000);
        console.log(`Waiting for WebSocket connections...`);

        this.clientManager = new ClientManager();
    }

    protected onConnection(socket: WebSocket, request: IncomingMessage) {
        const uuid = uuidGenerator();
        console.debug(`New WebSocket connection ${uuid}`);
        this.checkOpenSockets();
        this.clientSockets.set(uuid, new ClientSocket(socket, uuid, this.serverUuid));
    }

    protected onError(error: Error) {
        throw error;
    }

    protected checkOpenSockets() {
        for (const [socketId, socket] of this.clientSockets) {
            if (!socket.isConnected) {
                console.debug(`Found closed socket ${socket.uuid}. Removing.`)
                socket.close();
                this.clientSockets.delete(socketId);
            }
        }
    }
}