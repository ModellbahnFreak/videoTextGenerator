// CAUTION: Code of EventManager.ts shared 1:1 between backend and frontend
import type { EventListener, ListenerOptions, ROConsumer } from "@videotextgenerator/api";
import { uuidGenerator } from "../utils.js";

export class EventManager {

    protected readonly eventListeners: Map<string | null, Map<string | null, Map<EventListener | ROConsumer<unknown>, boolean>>> = new Map();
    protected readonly knownEvtUuids: Set<string> = new Set();

    constructor() {

    }

    protected callListeners(listeners: Map<EventListener | ROConsumer<unknown>, boolean> | undefined, topic: string, event: string, payload: unknown, evtUuid: string) {
        if (!listeners) {
            return;
        }
        for (const [listener, once] of listeners) {
            if (listener.length == 1) {
                (listener as ROConsumer<unknown>)(payload);
            } else {
                (listener as EventListener)(topic, event, payload, evtUuid);
            }
            listener(topic, event, payload, evtUuid);
            if (once) {
                listeners.delete(listener);
            }
        }
    }

    async raise(topic: string, event: string, payload: unknown, evtUuid: string = uuidGenerator()): Promise<boolean> {
        //todo: return false on not allowed
        if (this.knownEvtUuids.has(evtUuid)) {
            return true;
        }
        this.knownEvtUuids.add(evtUuid);

        const specificListeners = this.eventListeners.get(topic)?.get(event);
        this.callListeners(specificListeners, topic, event, payload, evtUuid);
        const eventGenericListeners = this.eventListeners.get(topic)?.get(null);
        this.callListeners(eventGenericListeners, topic, event, payload, evtUuid);
        const topicGenericListeners = this.eventListeners.get(null)?.get(event);
        this.callListeners(topicGenericListeners, topic, event, payload, evtUuid);
        const genericListeners = this.eventListeners.get(null)?.get(null);
        this.callListeners(genericListeners, topic, event, payload, evtUuid);
        return true;
    }

    on(listener: EventListener | ROConsumer<unknown>, options: Partial<ListenerOptions> = {}): void {
        const topic = options.topic ?? null;
        const event = options.dataKeyOrEvent ?? null;

        let topicListeners = this.eventListeners.get(topic);
        if (!topicListeners) {
            topicListeners = new Map();
            this.eventListeners.set(topic, topicListeners)
        }

        let eventSpecificListeners = topicListeners.get(event);
        if (!eventSpecificListeners) {
            eventSpecificListeners = new Map();
            topicListeners.set(event, eventSpecificListeners);
        }

        eventSpecificListeners.set(listener, !!options.once);
    }

    off(listener: EventListener | ROConsumer<unknown>, options: Partial<ListenerOptions> | undefined): void {
        if (options) {
            const topic = options.topic ?? null;
            const event = options.dataKeyOrEvent ?? null;

            this.eventListeners.get(topic)?.get(event)?.delete(listener);
        } else {
            for (const [_, topicListeners] of this.eventListeners) {
                for (const [_, eventSpecificListeners] of topicListeners) {
                    eventSpecificListeners.delete(listener);
                }
            }
        }
    }
}