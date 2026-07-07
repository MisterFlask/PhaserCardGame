import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { IronFilings } from "../../relics/common/IronFilings";

class SubmitToInspectionChoice extends AbstractChoice {
    private cost = 25;
    constructor() {
        super(
            "WIRE: Pay the £25 inspection fee.",
            "Comply. Receive a certified-safe fitting."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Foreman Fiddler-toot walked the crawler twice, tapping every rivet with his wrench. [color=white]\"Passes. Barely,\"[/color] he grunted, bolting on a Union-stamped brace. \"Solidarity discount. Don't tell Cranford-Reeves.\"\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
        const relic = new IronFilings();
        this.addLedgerItem(relic);
        this.actionManager().displaySubtitle(`Received ${relic.getDisplayName()}`, 2000);
    }
}

class WaveThePaperworkChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Wave the Company charter.",
            "Invoke extraterritorial privilege. Free, but memorable."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He read the charter's fine print aloud, unimpressed, and let us through anyway. [color=white]\"Noted,\"[/color] he said, writing something in a ledger of his own — the Union keeps files too, it turns out.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class StokersSafetyInspectionEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Union Inspection";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Dis, Furnace approach.\n" +
            "A picket line of stokers has stopped traffic for an impromptu safety audit. Foreman Fiddler-toot wants his inspection fee or, failing that, our papers. Behind him the Furnace roars on, indifferent to either outcome. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new SubmitToInspectionChoice(),
            new WaveThePaperworkChoice()
        ];
    }
}
