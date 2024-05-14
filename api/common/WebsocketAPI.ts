export interface WebsocketMessage {
    type: "dataKey" | "event" | "dataKeyRequest";
}

export interface WebsocketDataKeyMessage extends WebsocketMessage {
    type: "dataKey";
    uuid: string;
    dataKey: string;
    value: unknown;
}

export interface WebsocketEventMessage extends WebsocketMessage {
    type: "event";
    uuid: string;
    event: string;
    payload: unknown;
}

export interface WebsocketDataKeyRequestMessage extends WebsocketMessage {
    type: "dataKeyRequest";
    uuid: string;
    dataKey: string;
}