export type DataKeyListener = (topic: string, dataKey: string, value: unknown, version?: number) => void;
export type EventListener = (topic: string, event: string, payload: unknown, eventUuid?: string) => void;
export type ListenerOptions = { once: boolean, topic: string | undefined, dataKeyOrEvent: string | undefined }