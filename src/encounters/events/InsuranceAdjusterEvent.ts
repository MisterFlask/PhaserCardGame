import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { HealthPotion } from "../../consumables/HealthPotion";

class FileTheClaimChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: File the claim. All of it.",
            "Report every scrape honestly. Gain a Health Potion, lose £20 in premiums."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He itemized every bruise with unsettling enthusiasm, revised our premium upward, but issued a proper field medical kit as compensation. \"Thoroughness protects us both,\" he said, in the tone of a threat.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= 20; }
    effect(): void {
        this.actionManager().modifyMoney(-20);
        const potion = new HealthPotion();
        this.addConsumable(potion);
        this.actionManager().displaySubtitle(`Received ${potion.getDisplayName()}`, 2000);
    }
}

class UnderreportChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Underreport. Keep premiums low.",
            "Downplay the risks. No effect, but no reward either."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He noted our suspiciously clean record with a raised eyebrow and moved on, unconvinced but unwilling to argue with a signed form. Premiums, for now, remain untouched.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class InsuranceAdjusterEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Insurance Adjuster";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — brief roadside halt.\n" +
            "A Company adjuster has intercepted us to assess \"field risk exposure\" ahead of next quarter's premiums. He is going through Morrison's scars with a magnifying glass and a very small pencil. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new FileTheClaimChoice(),
            new UnderreportChoice()
        ];
    }
}
