export interface WebsocketMessage {
    type: "dataKey" | "event" | "dataKeyRequest" | "subscribe" | "login" | "clientConfig" | "error";
}

export interface WebsocketDataKeyMessage extends WebsocketMessage {
    type: "dataKey";
    topic: string;
    dataKey: string;
    value: unknown;
    version: number;
    subversion: number;
}

export interface WebsocketEventMessage extends WebsocketMessage {
    type: "event";
    topic: string;
    event: string;
    payload: unknown;
    evtUuid: string;
}

export interface WebsocketDataKeyRequestMessage extends WebsocketMessage {
    type: "dataKeyRequest";
    topic: string;
    dataKey: string;
}

export interface WebsocketSubscribeMessage extends WebsocketMessage {
    type: "subscribe",
    topics: string[],
}

export interface WebsocketLoginMessage extends WebsocketMessage {
    type: "login",
    token?: string
}

export interface WebsocketClientConfigMessage extends WebsocketMessage {
    type: "clientConfig",
    uuid: string,
    serverUuid: string,
    config: any //todo
}

export interface WebsocketErrorMessage extends WebsocketMessage {
    type: "error",
    message?: string,
    relatesTo?: WebsocketMessage
}