import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { RelicsLibrary } from "../../relics/RelicsLibrary";
import { ActionManager } from "../../utils/ActionManager";

class FuturesTradingChoice extends AbstractChoice {
    constructor() {
        super(
            "Short Emotional Futures",
            "Gain 25 Denarians (Risk 2 Stress)"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Brokers in waistcoats scribble complex equations across blackboards. You receive a promissory note etched with self-modifying clauses that squirm under inspection.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(25);
    }
}

class MemoryCollateralChoice extends AbstractChoice {
    constructor() {
        super(
            "Pledge Mnemonic Collateral",
            "Remove 1 card.  Gain 1 random Relic of equal rarity."
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The vault door grinds open, revealing shelves stacked with glowing memory-crystals. Your selected cards vanish into the mnemonic reserves, replaced by a relic humming with borrowed power.";
    }

    canChoose(): boolean {
        return false;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        // TODO IMPLEMENT: rare card removal
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        actionManager.addRelicToInventory(relic);
    }
}

export class SorrowFuturesEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Sorrow Futures Exchange";
        this.description = "A vast trading floor where clerks in pneumatic tubes shout derivatives prices. Blackboards display shifting equations that calculate the metaphysical value of human suffering.\n\n" +
            "A floor manager adjusts their abacus: [color=white]\"Current volatility index at 78.3% - prime conditions for emotional arbitrage!\"[/color]";
        this.choices = [new FuturesTradingChoice(), new MemoryCollateralChoice()];
    }
} 