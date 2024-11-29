import { StokersVersusAristocracy } from "../encounters/events/StokersVersusAristocracy";
import { AbstractEvent } from "./AbstractEvent";

export class EventsManager {
    private static instance: EventsManager;
    private events: AbstractEvent[] = [
        new StokersVersusAristocracy()
    ];

    private constructor() {}

    public static getInstance(): EventsManager {
        if (!EventsManager.instance) {
            EventsManager.instance = new EventsManager();
        }
        return EventsManager.instance;
    }

    public getRandomEvent(): AbstractEvent {
        const event = this.events[Math.floor(Math.random() * this.events.length)];
        return event;
    }

    public getAllEvents(): AbstractEvent[] {
        return this.events;
    }
}
