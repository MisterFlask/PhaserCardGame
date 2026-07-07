import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { EcclesiasticalRecommendation } from "../../relics/special/EcclesiasticalRecommendation";

class SurrenderLedgerChoice extends AbstractChoice {
    private cost = 40;
    constructor() {
        super(
            "WIRE: Pay £40. Keep the ledger sealed.",
            "Bribe the revenant auditor to lose our paperwork elsewhere."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The auditor counted the coin twice, once aloud, once in a whisper only the dead could follow. Stamped our file [color=white]\"MISLAID.\"[/color] Grinned with too many teeth for a face that thin.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class SubmitToInspectionChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Submit to inspection.",
            "Let it examine everything. One man gains 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "It read Hutchinson's service record aloud, including entries he swears he never signed. He hasn't stopped shaking. In exchange it issued us a chit of good standing — surprisingly official for something written in graveyard dust.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
        const writ = new EcclesiasticalRecommendation();
        this.addLedgerItem(writ);
        this.actionManager().displaySubtitle(`Received ${writ.getDisplayName()}`, 2000);
    }
}

class IgnoreChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Ignore it. Keep marching.",
            "The dead can file their own complaints."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "It followed us for four hundred yards, reciting boundary clauses from a war that predates the Company, before losing interest and returning to its trench. Bureaucracy, it seems, is also mortal — eventually.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {}
}

export class DeepFranceTrenchAuditEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Revenant Auditor";
        this.portraitName = "placeholder_event_background_1";
        this.description = "DISPATCH — Deep France, forward trench.\n" +
            "A boundary official in a rotted service coat has emerged from the parapet demanding our concession papers. He is, by his own insignia, deceased since 1814, and extremely thorough about it. Deep France Concession Holdings will want to know either way. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new SurrenderLedgerChoice(),
            new SubmitToInspectionChoice(),
            new IgnoreChoice()
        ];
    }
}
