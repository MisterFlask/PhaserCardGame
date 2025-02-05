import { AbstractRelic } from "../relics/AbstractRelic";
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
    public parentEvent?: AbstractEvent;

    // helper functions
    protected actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
    }

    protected gameState(): GameState {
        return ActionManagerFetcher.getGameState();
    }

    protected addLedgerItem(ledgerItem: AbstractRelic): void {
        this.actionManager().createLedgerItem(ledgerItem);
    }

}
export class FinishChoice extends AbstractChoice {
    constructor() {
        super("Ah.", ".");
        this.nextEvent = null;
    }

    canChoose(): boolean {
        return true;
    }

    effect(): void {
        this.actionManager().emitEvent("showMapOverlay", {});
    }
}

export class AbstractEvent {
    public portraitName: string = "placeholder_event_background_1";
    public name: string = "";
    public description: string = "";
    public choices: AbstractChoice[] = [new FinishChoice()];
    public parentEvent?: AbstractEvent;
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

    protected addLedgerItem(ledgerItem: AbstractRelic): void {
        this.actionManager().createLedgerItem(ledgerItem);
    }

} 


/// an event that tells the player the textual outcome of the encounter.
export class DeadEndEvent extends AbstractEvent {
    constructor() {
        super();
        this.choices = [
            new FinishChoice()
        ];
    }
}
