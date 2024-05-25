import type { WebsocketMessage, WebsocketLoginMessage } from "@videotextgenerator/api"
import { BackendClient } from "./BackendClient.js";
import { ClientRepository } from "../repository/ClientRepository.js";
import { ClientSocket } from "./ClientSocket.js";

export class ClientManager {
    protected readonly clients: Map<string, BackendClient> = new Map();

    constructor(
        protected clientRepository: ClientRepository
    ) {}

    async loginClient(socket: ClientSocket, msg?: WebsocketLoginMessage): Promise<WebsocketMessage> {
        let clientModel = await this.clientRepository.loginClient(msg?.token);
        if (!clientModel) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Login error. Will use last login or create new one",
                relatesTo: msg
            }
            socket.send(err);
            return err;
        }
        let client = this.clients.get(clientModel);
        if (!client) {
            client = new BackendClient();
            this.clients.set(clientModel.uuid, client);
        }

        if (socket.client) {
            client.removeSocket(socket.client);
        }
        socket.client = client;
        client.addSocket(socket);

        const clientConfig: WebsocketClientConfigMessage = {
            type: "clientConfig",
            uuid: newClient.uuid,
            serverUuid: this.serverUuid,
            config: {},
        };
        socket.send(clientConfig);
    }
}