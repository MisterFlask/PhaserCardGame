import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { AdrenalineCharge } from "../../consumables/AdrenalineCharge";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class VolunteerTheCrewChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Volunteer the crew. Extra shift.",
            "The men stoke the grates for an hour. Gain a consumable, one man gains 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "An hour of shovel work in heat that peeled paint off the crawler. Hutchinson came out swearing fluently in three languages, none of them his own. The Union foreman tossed us a stimulant vial by way of thanks — \"for the road.\"\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        this.addConsumable(new AdrenalineCharge());
    }
}

class PayForSubstituteLaborChoice extends AbstractChoice {
    private cost = 30;
    constructor() {
        super(
            "WIRE: Pay £30 for hired stokers.",
            "Let the Union supply substitute labor instead."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Money changed hands quietly, the Union way — no receipt, no questions. The grates got their fuel and my men got to keep their eyebrows. Everyone considered it a fair exchange.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class DeclineChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Decline. We're contractors, not stokers.",
            "Politely refuse the extra shift."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The foreman shrugged, entirely unsurprised. [color=white]\"British,\"[/color] he muttered, in the tone of a man noting the weather, and went back to his own grate without further comment.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class FurnaceOvertimeRequestEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Furnace Wants More Hands";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — the Furnace of Dis.\n" +
            "A grate's gone short-staffed and the Union foreman, sweating coal dust, asks if our men fancy an hour's honest labor — or if the Company would rather pay for someone else's. The furnace does not care which; it simply wants feeding. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new VolunteerTheCrewChoice(),
            new PayForSubstituteLaborChoice(),
            new DeclineChoice()
        ];
    }
}
