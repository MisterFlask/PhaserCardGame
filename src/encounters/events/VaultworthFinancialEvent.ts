import { AbstractChoice, AbstractEvent, DeadEndEvent } from "../../events/AbstractEvent";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { ActionManager } from "../../utils/ActionManager";

class DepositedSovereignInfernalNotes extends AbstractRelic {
    constructor() {
        super()
        this.id = "DEPOSITED_SOVEREIGN_INFERNAL_NOTES";
        this.stacks = 0;

    }

    getDisplayName(): string {
        return "Deposited Sovereign Infernal Notes";
    }

    getDescription(): string {
        return "You have some durians deposited with the Vaultworth Financial Group.";
    }
}



class SovereignInfernalNotesExchangeChoice extends AbstractChoice {
    constructor() {

        super(
            "Access Sovereign Infernal Notes Exchange Desk",
            "Convert 10 Pounds Sterling to 150 Sovereign Infernal Notes"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "Tellers in pinstripe suits stamp your documents with infernal seals. The air smells of ink and brimstone as your pounds sterling dissolve into shimmering currency.";
    }

    canChoose(): boolean {
        return this.gameState().britishPoundsSterling >= 10;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifyPromissoryNotes(-10);
        actionManager.modifySovereignInfernalNotes(150);
    }
}

class LiquidityAssistanceChoice extends AbstractChoice {
    constructor() {
        super(
            "Request Liquidity Assistance",
            "Gain 50 Sovereign Infernal Notes"
        );
        this.nextEvent = new DeadEndEvent();
        this.nextEvent.description = "The loan officer's monocle glints as they slide a contract across the desk. The small print writhes like living things.  You're pretty sure it's fine.";
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        const actionManager = ActionManager.getInstance();
        actionManager.modifySovereignInfernalNotes(50);
    }
}

export class VaultworthFinancialEvent extends AbstractEvent {
    constructor() {
        super();
        this.name = "Vaultworth Financial Group";
        this.description = "A neoclassical banking hall where floating ledgers track infernal transactions in real-time. Robotic clerks shuffle between marble columns, their abacus-like appendages clicking furiously.\n\n" +
            "A manager adjusts their pince-nez: [color=white]\"Current interest rates at 6.66%. Would you care to discuss our premium wealth management services?\"[/color]";
        this.choices = [new SovereignInfernalNotesExchangeChoice(), new LiquidityAssistanceChoice()];
    }
} 