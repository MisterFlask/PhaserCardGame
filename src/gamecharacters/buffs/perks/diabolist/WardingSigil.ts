import { AbstractBuff } from "../../AbstractBuff";
import { Weak } from "../../standard/Weak";

/**
 * Diabolist perk. Combat-start Weak applied to all enemies, same proven
 * shape as perks/archon/ReadTheRiotAct.ts / persona/BlindingTattoo.ts.
 */
export class WardingSigil extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Warding Sigil";
    }

    override getDescription(): string {
        return `At the start of combat, apply ${this.getStacksDisplayText()} Weak to all enemies. Chalked in the Company's approved occult notation, filed with the Foreign Office.`;
    }

    override onCombatStart(): void {
        const enemies = this.gameState.combatState.enemies;
        for (const enemy of enemies) {
            this.actionManager.applyBuffToCharacter(enemy, new Weak(this.stacks));
        }
    }
}
