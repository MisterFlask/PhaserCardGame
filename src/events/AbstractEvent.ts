import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractRelic } from "../relics/AbstractRelic";
import { GameState } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";

export abstract class AbstractChoice {
    constructor(
        public text: string,
        public mechanicalInformationText: string = "",
    ) {}

    init(): void {
        // override in subclasses
    }

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

    ///helper methods
    public getRandomCharacter(): BaseCharacter {
        const gameState = this.gameState();
        const characters = gameState.currentRunCharacters;
        return characters[Math.floor(Math.random() * characters.length)];
    }

    /**
     * Retrieve the event character assigned in the parent event.
     * Falls back to a random character if the slot is undefined.
     */
    protected getEventCharacter(slot: 1 | 2 | 3): BaseCharacter {
        if (this.parentEvent) {
            switch (slot) {
                case 1:
                    if (this.parentEvent.character_1) return this.parentEvent.character_1;
                    break;
                case 2:
                    if (this.parentEvent.character_2) return this.parentEvent.character_2;
                    break;
                case 3:
                    if (this.parentEvent.character_3) return this.parentEvent.character_3;
                    break;
            }
        }
        return this.getRandomCharacter();
    }

}
export class FinishChoice extends AbstractChoice {
    constructor() {
        super("Ah.", "");
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
    // Characters selected for this event instance
    public character_1?: BaseCharacter;
    public character_2?: BaseCharacter;
    public character_3?: BaseCharacter;
    private initialized: boolean = false;

    /**
     * Called when the event is shown. Randomizes the character assignments so
     * that choices can consistently reference them.
     */
    public init(): void {
        if (this.initialized) {
            return;
        }

        // If we have a parent event, inherit its characters so the chain is consistent
        if (this.parentEvent) {
            this.character_1 = this.parentEvent.character_1;
            this.character_2 = this.parentEvent.character_2;
            this.character_3 = this.parentEvent.character_3;
            this.initialized = true;
            return;
        }

        const characters = [...this.gameState().currentRunCharacters];
        let available = [...characters];

        const pull = (preferLiving: boolean): BaseCharacter => {
            let pool = preferLiving
                ? available.filter(c => !c.isDead())
                : available;

            if (pool.length === 0) {
                pool = available;
            }

            if (pool.length === 0) {
                // As a last resort fall back to the full character list
                pool = characters;
            }

            const idx = Math.floor(Math.random() * pool.length);
            const char = pool[idx];
            const removeIdx = available.indexOf(char);
            if (removeIdx !== -1) {
                available.splice(removeIdx, 1);
            }
            return char;
        };

        this.character_1 = pull(true); // Avoid assigning dead characters if possible
        this.character_2 = pull(true);
        this.character_3 = pull(true);

        this.initialized = true;
    }
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
