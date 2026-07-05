import { AngelicTattooEvent } from "../encounters/events/AngelicTattooEvent";
import { ArmsDealerPropositionEvent } from "../encounters/events/ArmsDealerProposition";
import { CheckpointSmugglerEvent } from "../encounters/events/CheckpointSmugglerEvent";
import { DiseaseForMoneyEvent } from "../encounters/events/DiseaseForRewardEvent";
import { DutchZooEscapeEvent } from "../encounters/events/DutchZooEscapeEvent";
import { GamblingChaplainEvent } from "../encounters/events/GamblingChaplainEvent";
import { MarshBrigandsTollEvent } from "../encounters/events/MarshBrigandsTollEvent";
import { AbstractEvent } from "./AbstractEvent";

export class EventsManager {
    private static instance: EventsManager;

    // Factories, not instances: events hold per-occurrence state on their
    // choices (consumable snapshots, nextEvent chains that null themselves),
    // so each occurrence needs a fresh object graph.
    private eventFactories: (() => AbstractEvent)[] = [
        () => new AngelicTattooEvent(),
        () => new DiseaseForMoneyEvent(),
        () => new DutchZooEscapeEvent(),
        () => new CheckpointSmugglerEvent(),
        () => new MarshBrigandsTollEvent(),
        () => new ArmsDealerPropositionEvent(),
        () => new GamblingChaplainEvent(),
    ];

    private constructor() {}

    public static getInstance(): EventsManager {
        if (!EventsManager.instance) {
            EventsManager.instance = new EventsManager();
        }
        return EventsManager.instance;
    }

    public getRandomEvent(): AbstractEvent {
        const factory = this.eventFactories[Math.floor(Math.random() * this.eventFactories.length)];
        return factory();
    }

    public getAllEvents(): AbstractEvent[] {
        return this.eventFactories.map(factory => factory());
    }
}
