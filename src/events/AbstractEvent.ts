import { LedgerItem } from "../ledger/LedgerItem";
import { GameState } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";

export abstract class AbstractChoice {
    constructor(
        public text: string,
        public mechanicalInformationText: string = "",
    ) {}

    abstract canChoose(): boolean;
    abstract effect(): void;
    public nextEvent: AbstractEvent | null = null;

    // helper functions
    protected actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
    }

    protected gameState(): GameState {
        return ActionManagerFetcher.getGameState();
    }

    protected addLedgerItem(ledgerItem: LedgerItem): void {
        this.actionManager().createLedgerItem(ledgerItem);
    }
}

export class AbstractEvent {
    public portraitName: string = "";
    public name: string = "";
    public description: string = "";
    public choices: AbstractChoice[] = [];

    public isEligible(): boolean {
        return true;
    }

    // helper functions
    protected actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
    }

    protected gameState(): GameState {
        return ActionManagerFetcher.getGameState();
    }

    protected addLedgerItem(ledgerItem: LedgerItem): void {
        this.actionManager().createLedgerItem(ledgerItem);
    }
} 


/// an event that tells the player the textual outcome of the encounter.
export class DeadEndEvent extends AbstractEvent {
    constructor() {
        super();
        this.description = "We're done here.";
    }
}
