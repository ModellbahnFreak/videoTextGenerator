import { WebsocketMessage } from "./WebsocketAPI";

export type DataKeyListener = (topic: string, dataKey: string, value: unknown, version: number, subversion: number) => void;
export type EventListener = (topic: string, event: string, payload: unknown, eventUuid: string) => void;

/**
 * @returns `true` iff the listener should be removed after this call
 */
export type MessageListener = (msg: WebsocketMessage) => boolean

export interface ListenerOptions {
    once: boolean;
    topic: string | undefined;
    dataKeyOrEvent: string | undefined;
}