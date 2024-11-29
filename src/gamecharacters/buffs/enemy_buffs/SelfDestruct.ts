import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class SelfDestruct extends AbstractBuff {
    constructor(stacks: number = 1, turnsUntilExplosion: number = 3) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.secondaryStacks = turnsUntilExplosion;
        this.showSecondaryStacks = true;
    }

    override getDisplayName(): string {
        return "Self Destruct";
    }
    override getDescription(): string {
        let turnText = "turn";
        if (this.secondaryStacks !== 1) {
            turnText += "s";
        }
        
        let explosionWarning = "";
        if (this.secondaryStacks === 1) {
            explosionWarning = " (Explodes THIS TURN!)";
        }
        
        return `After ${this.secondaryStacks} ${turnText}, deals 999 damage to self and ${this.getStacksDisplayText()} damage to all player characters.${explosionWarning}`;
    }

    override onTurnEnd_CharacterBuff(): void {
        this.secondaryStacks--;
        if (this.secondaryStacks <= 0) {
            this.explode();
        }
    }

    private explode(): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        const gameState = GameState.getInstance();
        const actionManager = ActionManager.getInstance();

        // Deal 999 damage to self
        actionManager.dealDamage({
            baseDamageAmount: 999,
            sourceCharacter: owner,
            target: owner,
            fromAttack: true,
        });

        // Deal [stacks] damage to all player characters
        gameState.combatState.playerCharacters.forEach(character => {
            actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                sourceCharacter: owner,
                target: character,
            });
        });
    }
}
