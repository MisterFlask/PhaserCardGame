import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { FieldSurgeonsKit } from "../../consumables/FieldSurgeonsKit";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class PayInFullChoice extends AbstractChoice {
    private cost = 35;
    constructor() {
        super(
            "WIRE: Pay £35. Bill the client.",
            "Settle the officers' mess account in full."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Madame Vachon counted the notes into a cashbox that has outlasted several regimes. [color=white]\"You eat well for a company that does not exist yet,\"[/color] she said, and threw in a jar of something restorative, gratis.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
        const kit = new FieldSurgeonsKit();
        this.addConsumable(kit);
        this.actionManager().displaySubtitle(`Received ${kit.getDisplayName()}`, 2000);
    }
}

class DisputeTheBillChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Dispute the bill.",
            "Argue the charges. Gain 2 Stress, save the money."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Twenty minutes of increasingly personal arithmetic. She won, of course — the ledger predates my employment, possibly my birth. Left with my coin intact and my confidence considerably reduced.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
    }
}

class RunTheTabChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Run the tab. Not our problem.",
            "Leave without paying. Someone else's war, someone else's bill."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "She didn't shout. She simply wrote our name in a second ledger, the one she keeps for people she remembers. Somehow this felt worse than any sum she might have named.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class MaisonVachonMessBillEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Officers' Mess";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — Deep France, behind the lines.\n" +
            "Maison Vachon's supply cart, running hot stew to a front that never ends. Madame Vachon presents our bill from three sorties back with the patience of a woman who has fed armies more permanent than this one. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new PayInFullChoice(),
            new DisputeTheBillChoice(),
            new RunTheTabChoice()
        ];
    }
}
