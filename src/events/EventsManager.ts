import { AngelicTattooEvent } from "../encounters/events/AngelicTattooEvent";
import { DiseaseForMoneyEvent } from "../encounters/events/DiseaseForRewardEvent";
import { DutchZooEscapeEvent } from "../encounters/events/DutchZooEscapeEvent";
import { CheckpointSmugglerEvent } from "../encounters/events/CheckpointSmugglerEvent";
  
import { MarshBrigandsTollEvent } from "../encounters/events/MarshBrigandsTollEvent";
import { ArmsDealerPropositionEvent } from "../encounters/events/ArmsDealerProposition";
import { AbstractEvent } from "./AbstractEvent";

export class EventsManager {
    private static instance: EventsManager;
    private events: AbstractEvent[] = [
        new AngelicTattooEvent(),
        new DiseaseForMoneyEvent(),
        new DutchZooEscapeEvent(),
        new CheckpointSmugglerEvent(),
        new MarshBrigandsTollEvent(),
        new ArmsDealerPropositionEvent(),
 
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
