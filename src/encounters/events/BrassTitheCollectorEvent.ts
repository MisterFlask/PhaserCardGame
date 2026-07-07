import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class PayTheTitheChoice extends AbstractChoice {
    private cost = 45;
    constructor() {
        super(
            "WIRE: Pay £45. Keep moving.",
            "Settle the industrialist's toll without argument."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "He counted the notes without looking at them, monocle fixed on Morrison the entire time. [color=white]\"Smooth passage, old sport,\"[/color] he wheezed, waving us through a gate that definitely wasn't there an hour ago.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

class ArgueJurisdictionChoice extends AbstractChoice {
    constructor() {
        super(
            "WIRE: Argue jurisdiction.",
            "Contest the toll on Company charter grounds. Gain 2 Stress."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Forty minutes of increasingly circular argument about whose brass gate this technically is. We won, I think, though I've lost track of what winning meant by the end. Thompson's left eye hasn't stopped twitching.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return true; }
    effect(): void {
        const character = this.getEventCharacter(1);
        this.actionManager().applyBuffToCharacter(character, new Stress(2));
    }
}

class RamTheGateChoice extends AbstractChoice {
    private cost = 15;
    constructor() {
        super(
            "WIRE: Ram it. Bill maintenance to the client.",
            "Force the gate. Costs £15 in crawler repairs."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The gate folded like the decorative brass it apparently was. He shrieked something about \"vandalism\" and \"the proper channels\" as we rattled past, chins wobbling with indignation.\n" +
            "— Cavendish";
    }
    canChoose(): boolean { return this.gameState().moneyInVault >= this.cost; }
    effect(): void {
        this.actionManager().modifyMoney(-this.cost);
    }
}

export class BrassTitheCollectorEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "The Toll Gate That Wasn't There";
        this.portraitName = "placeholder_event_background_2";
        this.description = "DISPATCH — Dis, brass district.\n" +
            "A corpulent industrialist devil has erected a private gate across a public thoroughfare, monocle gleaming with the confidence of a man who owns the judge. He wants a toll. The road is, as far as I can tell, entirely his invention. Instructions?\n" +
            "— Cavendish";
        this.choices = [
            new PayTheTitheChoice(),
            new ArgueJurisdictionChoice(),
            new RamTheGateChoice()
        ];
    }
}
