import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { SurveyorsFieldGlasses } from "../../consumables/SurveyorsFieldGlasses";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class EscortHimChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Escort him. Let him work.",
            "Detour for his survey. One man gains 2 Stress from the delay's dangers."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He sketched furiously for an hour while we stood watch over increasingly agitated terrain. Hutchinson's nerves are shot, but the cartographer left us a set of his field glasses, delighted with the data.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        const glasses = new SurveyorsFieldGlasses();
        this.addConsumable(glasses);
        this.actionManager().displaySubtitle(`Received ${glasses.getDisplayName()}`, 2000);
    }
}

class ChargeHimForTheDelayChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Charge him for our time. £20.",
            "Demand payment for the inconvenience."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He paid without much argument, muttering about \"mercenary escorts\" while packing his instruments. Fair enough — we are, in fact, mercenary escorts.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(20);
    }
}

class LeaveHimBehindChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Leave him. Schedule is schedule.",
            "No time for cartography today."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He called after us about \"unmapped hazards\" as we rolled on, which struck me as an odd thing to shout at people actively leaving an area he hadn't finished mapping.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class CartographersCommissionEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Company Cartographer";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — open ground, unmapped.\n" +
            "A Company surveyor has flagged us down, insisting this stretch is officially blank on his charts and he intends to fix that today, with or without our schedule's cooperation. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new EscortHimChoice(),
            new ChargeHimForTheDelayChoice(),
            new LeaveHimBehindChoice()
        ];
    }
}
