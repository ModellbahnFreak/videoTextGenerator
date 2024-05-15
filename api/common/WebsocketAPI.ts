export interface WebsocketMessage {
    type: "dataKey" | "event" | "dataKeyRequest" | "subscribe";
}

export interface WebsocketDataKeyMessage extends WebsocketMessage {
    type: "dataKey";
    topic: string;
    dataKey: string;
    value: unknown;
    version: number;
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

export interface WesocketSubscribeMessage extends WebsocketMessage {
    type: "subscribe",
    topic: string,
}