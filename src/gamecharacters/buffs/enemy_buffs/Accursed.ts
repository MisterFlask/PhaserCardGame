import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";
import { Cursed } from "../standard/Cursed";

export class Accursed extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Accursed";
    }

    override getDescription(): string {
        return `At the start of combat, apply ${this.getStacksDisplayText()} Cursed to each player character.`;
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        gameState.combatState.playerCharacters.forEach((character) => {
            this.actionManager.applyBuffToCharacterOrCard(character, new Cursed(this.stacks));
        });
    }
}
