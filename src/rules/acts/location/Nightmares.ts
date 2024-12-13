import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';

export class NightmaresModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Nightmares";
    }

    getDescription(): string {
        return `When resting, all characters gain ${this.getStacksDisplayText()} Stress.`;
    }

    onRest(): void {
        const characters = this.gameState.currentRunCharacters;
        for (const character of characters) {
            this.actionManager.applyBuffToCharacter(character, new Stress(this.stacks));
        }
    }
}
