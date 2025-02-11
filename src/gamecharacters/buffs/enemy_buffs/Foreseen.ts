import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Lethality";

export class Foreseen extends AbstractBuff {
    public imageName: string = "eyeball";
    private readonly name: string = "Foreseen";
    private readonly description: string = "Increases the strength of all enemies by [stacks]. Decreases by 1 at end of turn.";

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "eyeball";
    }

    getDisplayName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description.replace("[stacks]", this.stacks.toString());
    }

    onCardApplied(): void {
        // When applied to a card, increase enemy strength
        const owner = this.getOwnerAsPlayableCard();
        if (!owner) return;

        const combatState = this.gameState.combatState;
        combatState.enemies.forEach((enemy: BaseCharacter) => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Lethality(this.stacks));
        });
    }

    onBuffRemoved(): void {
        // When removed from a card, decrease enemy strength
        const owner = this.getOwnerAsPlayableCard();
        if (!owner) return;

        const combatState = this.gameState.combatState;
        combatState.enemies.forEach((enemy: BaseCharacter) => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Lethality(-this.stacks));
        });
    }

    onTurnEnd(): void {
        // Decrease stacks by 1 at end of turn
        if (this.stacks > 0) {
            this.stacks--;
            if (this.stacks === 0) {
                // If stacks reach 0, remove the buff
                const owner = this.getOwnerAsPlayableCard();
                if (owner) {
                    owner.buffs = owner.buffs.filter(buff => buff.id !== this.id);
                }
            }
        }
    }
} 