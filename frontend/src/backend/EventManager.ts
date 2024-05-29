// CAUTION: Code of EventManager.ts shared 1:1 between backend and frontend
import type { EventListener, ListenerOptions, ROConsumer } from "@videotextgenerator/api";
import { uuidGenerator } from "../utils.js";

export class EventManager {

    protected readonly eventListeners: Map<string | null, Map<string | null, Map<EventListener | ROConsumer<unknown>, ListenerOptions>>> = new Map();
    protected readonly knownEvtUuids: Set<string> = new Set();

    constructor() {

    }

    protected callListeners(
        listeners: Map<EventListener | ROConsumer<unknown>, ListenerOptions> | undefined,
        topic: string, event: string, payload: unknown, evtUuid: string
    ) {
        if (!listeners) {
            return;
        }
        for (const [listener, options] of listeners) {
            if (listener.length == 1) {
                (listener as ROConsumer<unknown>)(payload);
            } else {
                (listener as EventListener)(topic, event, payload, evtUuid);
            }
            if (options.once) {
                listeners.delete(listener);
            }
        }
    }

    async raise(topic: string, event: string, payload: unknown, evtUuid: string = uuidGenerator()): Promise<boolean> {
        //todo: return false on not allowed
        if (this.knownEvtUuids.has(evtUuid)) {
            console.log(`Event ${evtUuid} was previously raised. Not raising again`);
            return true;
        }
        this.knownEvtUuids.add(evtUuid);
        console.log(`Raising event ${evtUuid}`);

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
        const optionsWithDefault: ListenerOptions = {
            once: false,
            topic: undefined,
            dataKeyOrEvent: undefined,
            ...options
        }

        let topicListeners = this.eventListeners.get(optionsWithDefault.topic ?? null);
        if (!topicListeners) {
            topicListeners = new Map();
            this.eventListeners.set(optionsWithDefault.topic ?? null, topicListeners)
        }

        let eventSpecificListeners = topicListeners.get(optionsWithDefault.dataKeyOrEvent ?? null);
        if (!eventSpecificListeners) {
            eventSpecificListeners = new Map();
            topicListeners.set(optionsWithDefault.dataKeyOrEvent ?? null, eventSpecificListeners);
        }

        eventSpecificListeners.set(listener, optionsWithDefault);
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