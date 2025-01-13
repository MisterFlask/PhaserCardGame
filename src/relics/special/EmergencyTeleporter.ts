import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class EmergencyTeleporter extends AbstractRelic {
    private readonly STRESS_PENALTY = 2;
    private readonly MAX_USES_PER_RUN = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.SPECIAL;
        this.stackable = true;
        this.clickable = true;
        this.stacks = this.MAX_USES_PER_RUN; // Use stacks to track remaining uses
    }

    override getDisplayName(): string {
        return "Emergency Teleporter";
    }

    override getDescription(): string {
        return `Click to flee combat and grant each character ${this.STRESS_PENALTY} Stress. Can be used ${this.stacks} more time${this.stacks === 1 ? '' : 's'} this run.`;
    }

    override onClicked(): void {
        // Only allow use during combat (when there are enemies) and if we have uses remaining
        if (this.combatState.enemies.length === 0 || this.stacks <= 0) {
            return;
        }

        // Add stress to all player characters
        const gameState = GameState.getInstance();
        for (const character of gameState.combatState.playerCharacters) {
            this.actionManager.addStressToCharacter(character, this.STRESS_PENALTY);
        }

        // Decrement uses remaining
        this.stacks--;

        // Flee combat
        this.actionManager.fleeCombatAction();
    }
}
