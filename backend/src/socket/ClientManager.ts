import type { WebsocketMessage, WebsocketLoginMessage, DataKeyListener, ListenerOptions, EventListener, WebsocketErrorMessage, WebsocketClientConfigMessage, WebsocketDataKeyMessage } from "@videotextgenerator/api"
import { BackendClient } from "./BackendClient.js";
import { ClientRepository } from "../repository/ClientRepository.js";
import { ClientSocket } from "./Socket.js";
import { DataKeyManager } from "../data/DataKeyManager.js";
import { EventManager } from "../data/EventManager.js";
import { Client } from "../model/Client.js";
import { anySubnetMatches, isEnvTrue } from "../utils.js";

export class ClientManager {
    protected readonly clients: Map<string, BackendClient> = new Map();

    constructor(
        public readonly clientRepository: ClientRepository,
        public readonly dataKeyManager: DataKeyManager,
        public readonly eventManager: EventManager,
        protected readonly serverUuid: string,
    ) { }

    protected loginError(errorMsg: string, socket: ClientSocket, origMsg?: WebsocketLoginMessage) {
        const err: WebsocketErrorMessage = {
            type: "error",
            message: errorMsg,
            relatesTo: origMsg
        }
        socket.send(err);
    }

    async loginClient(socket: ClientSocket, msg?: WebsocketLoginMessage): Promise<void> {
        let clientModel: Client | null = null;
        if (msg?.token) {
            let uuid = msg?.token; //todo: parse jwt
            if (!msg?.token.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
                console.error("Token login not yet implemented");
                return this.loginError("Login method other than client UUID is not yet supported", socket, msg);
            }
            clientModel = await this.clientRepository.findOneBy({
                uuid: uuid
            });
        } else {
            if (isEnvTrue(process.env.VIDEOTEXTGENERATOR_ALLOW_ANONYMOUS_LOGIN) && anySubnetMatches(socket.remoteAddress, process.env.VIDEOTEXTGENERATOR_ANONYMOUS_LOGIN_IPS || "127.0.0.1/8,::1,::ffff:127.0.0.1/104")) {
                clientModel = new Client();
            } else {
                console.error(`Socket from ${socket.remoteAddress} tired to log in anonymously.`);
                return this.loginError("Not allowed to log in anonymously", socket, msg);
            }
        }

        if (!clientModel) {
            const err: WebsocketErrorMessage = {
                type: "error",
                message: "Login error. Make sure you use a valid token or are allowed to login anonymously",
                relatesTo: msg
            }
            socket.send(err);
            return;
        }
        const saved = await this.clientRepository.save(clientModel);
        console.debug(`Logging in client ${saved?.uuid}`);

        let client = this.clients.get(clientModel.uuid);
        if (!client) {
            client = new BackendClient(clientModel, this);
            this.clients.set(clientModel.uuid, client);
        }

        if (socket.client) {
            client.removeSocket(socket);
        }
        socket.client = client;
        client.addSocket(socket);

        const clientConfig: WebsocketClientConfigMessage = {
            type: "clientConfig",
            uuid: client.uuid,
            serverUuid: this.serverUuid,
            config: client.clientModel.config,
        };
        socket.send(clientConfig);
    }

    async dataKey(topic: string, dataKey: string, value: unknown, version: number = -1, subversion: number = 0): Promise<void> {
        await Promise.all([...this.clients.values()].map(c => c.dataKey(topic, dataKey, value, version, subversion)));
    }

    async event(topic: string, event: string, payload: unknown, evtUuid: string = "") {
        await Promise.all([...this.clients.values()].map(c => c.event(topic, event, payload, evtUuid)));
    }

}