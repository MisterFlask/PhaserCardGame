import { AngelicTattooEvent } from "../encounters/events/AngelicTattooEvent";
import { ArmsDealerPropositionEvent } from "../encounters/events/ArmsDealerProposition";
import { CheckpointSmugglerEvent } from "../encounters/events/CheckpointSmugglerEvent";
import { DiseaseForMoneyEvent } from "../encounters/events/DiseaseForRewardEvent";
import { DutchZooEscapeEvent } from "../encounters/events/DutchZooEscapeEvent";
import { GamblingChaplainEvent } from "../encounters/events/GamblingChaplainEvent";
import { MarshBrigandsTollEvent } from "../encounters/events/MarshBrigandsTollEvent";
import { DeepFranceTrenchAuditEvent } from "../encounters/events/DeepFranceTrenchAuditEvent";
import { MaisonVachonMessBillEvent } from "../encounters/events/MaisonVachonMessBillEvent";
import { ReichsinfernokorpsCryoTruceEvent } from "../encounters/events/ReichsinfernokorpsCryoTruceEvent";
import { EmperorUndyingConscriptEvent } from "../encounters/events/EmperorUndyingConscriptEvent";
import { StokersSafetyInspectionEvent } from "../encounters/events/StokersSafetyInspectionEvent";
import { BrassTitheCollectorEvent } from "../encounters/events/BrassTitheCollectorEvent";
import { FurnaceOvertimeRequestEvent } from "../encounters/events/FurnaceOvertimeRequestEvent";
import { FerrymansTollDisputeEvent } from "../encounters/events/FerrymansTollDisputeEvent";
import { BioluminescentEelTradeEvent } from "../encounters/events/BioluminescentEelTradeEvent";
import { FloatingIslandSquattersEvent } from "../encounters/events/FloatingIslandSquattersEvent";
import { ShareholdersNephewEvent } from "../encounters/events/ShareholdersNephewEvent";
import { SurpriseAuditEvent } from "../encounters/events/SurpriseAuditEvent";
import { InsuranceAdjusterEvent } from "../encounters/events/InsuranceAdjusterEvent";
import { ExpenseClaimDisputeEvent } from "../encounters/events/ExpenseClaimDisputeEvent";
import { ChaplainsReplacementEvent } from "../encounters/events/ChaplainsReplacementEvent";
import { CartographersCommissionEvent } from "../encounters/events/CartographersCommissionEvent";
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
        () => new DeepFranceTrenchAuditEvent(),
        () => new MaisonVachonMessBillEvent(),
        () => new ReichsinfernokorpsCryoTruceEvent(),
        () => new EmperorUndyingConscriptEvent(),
        () => new StokersSafetyInspectionEvent(),
        () => new BrassTitheCollectorEvent(),
        () => new FurnaceOvertimeRequestEvent(),
        () => new FerrymansTollDisputeEvent(),
        () => new BioluminescentEelTradeEvent(),
        () => new FloatingIslandSquattersEvent(),
        () => new ShareholdersNephewEvent(),
        () => new SurpriseAuditEvent(),
        () => new InsuranceAdjusterEvent(),
        () => new ExpenseClaimDisputeEvent(),
        () => new ChaplainsReplacementEvent(),
        () => new CartographersCommissionEvent(),
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
