import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class CooperateFullyChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Open the books. Cooperate.",
            "Full disclosure. Lose £25 in identified irregularities."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The auditor found £25 of what he termed \"creative rounding\" in Jenkins' receipts, docked it on the spot, and left satisfied. Jenkins looked personally wounded by the accusation of competence.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        this.actionManager().modifyMoney(-25);
    }
}

class StallHimChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Stall him. Misplace the ledger.",
            "Buy time with bureaucratic friction. Gain 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Thompson \"discovered\" the wrong ledger three times running while I apologized profusely. The auditor's patience visibly curdled, but he eventually gave up and left empty-handed. A hollow sort of victory.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
    }
}

class BribeHimChoice extends AbstractChoice {
    private cost = 40;
    constructor() {
        super(
            "WIRE: Pay him £40 to overlook it.",
            "A direct, unsubtle solution."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He pocketed the sum with the practiced ease of a man who has done this before, stamped our file [color=white]\"EXEMPLARY,\"[/color] and departed without a backward glance. Efficient, if morally untidy.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

export class SurpriseAuditEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Surprise Audit";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — mid-sortie, most inconveniently.\n" +
            "A Company auditor has caught up with us by handcar, ledger in hand, demanding to review our field expenditures on the spot. His pince-nez suggests he already suspects the worst. He is, unfortunately, correct. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new CooperateFullyChoice(),
            new StallHimChoice(),
            new BribeHimChoice()
        ];
    }
}
