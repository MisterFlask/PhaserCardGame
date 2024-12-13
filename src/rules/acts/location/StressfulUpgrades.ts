import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { PlayableCard } from '../../../gamecharacters/PlayableCard';

export class StressfulUpgradesModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Cursed Fires";
    }

    getDescription(): string {
        return `Whenever you upgrade a card, apply ${this.getStacksDisplayText()} Stress to a random character.`;
    }

    override onCardUpgraded(card: PlayableCard): void {
        const randomCharacter = this.gameState.getRandomAllyCharacter();
        this.actionManager.applyBuffToCharacter(randomCharacter, new Stress(this.stacks));
    }
}
