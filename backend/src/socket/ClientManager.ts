import type { WebsocketMessage, WebsocketLoginMessage, DataKeyListener, ListenerOptions, EventListener, WebsocketErrorMessage, WebsocketClientConfigMessage, WebsocketDataKeyMessage } from "@videotextgenerator/api"
import { BackendClient } from "./BackendClient.js";
import { ClientRepository } from "../repository/ClientRepository.js";
import { ClientSocket } from "./Socket.js";
import { DataKeyManager } from "../data/DataKeyManager.js";
import { EventManager } from "../data/EventManager.js";
import { Client } from "../model/Client.js";
import { anySubnetMatches, isEnvTrue } from "../utils.js";
import { JWTPayload, JWTVerifyResult, SignJWT, jwtVerify } from "jose";

const JWT_HEADER_ALG = "HS256";

export class ClientManager {
    protected readonly clients: Map<string, BackendClient> = new Map();
    protected readonly jwtSecret: Uint8Array | null;

    constructor(
        public readonly clientRepository: ClientRepository,
        public readonly dataKeyManager: DataKeyManager,
        public readonly eventManager: EventManager,
        protected readonly serverUuid: string,
    ) {
        if (!process.env.VIDEOTEXTGENERATOR_JWT_SECRET || process.env.VIDEOTEXTGENERATOR_JWT_SECRET.length <= 0) {
            this.jwtSecret = null;
        } else {
            this.jwtSecret = new TextEncoder().encode(process.env.VIDEOTEXTGENERATOR_JWT_SECRET);
        }
    }

    protected loginError(errorMsg: string, socket: ClientSocket, origMsg?: WebsocketLoginMessage) {
        const err: WebsocketErrorMessage = {
            type: "error",
            message: errorMsg,
            relatesTo: origMsg
        }
        socket.send(err);
    }

    protected async clientModelFromToken(token: string): Promise<Client | null> {
        if (token.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
            // uuid login
            return await this.clientRepository.findOneBy({
                uuid: token,
                uuidLoginAllowed: true
            });
        } else {
            if (this.jwtSecret) {
                let result: JWTVerifyResult<JWTPayload>;
                try {
                    result = await jwtVerify(token, this.jwtSecret, {});
                } catch (err) {
                    console.warn(`JWT verification failed: `, err);
                    return null;
                }
                //todo: make tokens revokable
                let clientModel = await this.clientRepository.findOneBy({
                    uuid: result.payload.sub
                });
                if (clientModel) {
                    console.debug(`${clientModel.uuid} logged in using token`);
                    return clientModel;
                }
                clientModel = new Client(result.payload.sub);
                clientModel.uuidLoginAllowed = isEnvTrue(process.env.VIDEOTEXTGENERATOR_UUID_LOGIN, false);
                console.debug(`Creating client for ${clientModel.uuid} due to valid token`);
                return this.clientRepository.createIfNotExists(clientModel);
            }
        }
        return null;
    }

    async loginClient(socket: ClientSocket, msg?: WebsocketLoginMessage): Promise<void> {
        let clientModel: Client | null = null;
        if (msg?.token) {
            clientModel = await this.clientModelFromToken(msg.token);
        } else {
            if (isEnvTrue(process.env.VIDEOTEXTGENERATOR_ALLOW_ANONYMOUS_LOGIN) && anySubnetMatches(socket.remoteAddress, process.env.VIDEOTEXTGENERATOR_ANONYMOUS_LOGIN_IPS || "127.0.0.1/8,::1,::ffff:127.0.0.1/104")) {
                clientModel = new Client();
                clientModel.uuidLoginAllowed = isEnvTrue(process.env.VIDEOTEXTGENERATOR_UUID_LOGIN, false);
                clientModel = await this.clientRepository.createIfNotExists(clientModel);
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

        let token: string | undefined;
        if (this.jwtSecret) {
            token = await new SignJWT()
                .setProtectedHeader({ alg: JWT_HEADER_ALG })
                .setIssuedAt()
                .setIssuer(this.serverUuid)
                .setExpirationTime("1h") //todo: allow tokens to be refreshed
                .setSubject(client.uuid)
                .sign(this.jwtSecret);
        }

        const clientConfig: WebsocketClientConfigMessage = {
            type: "clientConfig",
            uuid: client.uuid,
            serverUuid: this.serverUuid,
            config: client.clientModel.config,
            token
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