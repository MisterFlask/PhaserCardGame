import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';

export class SoulSuckingModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Soul Sucking";
    }

    getDescription(): string {
        return `At the start of the act, reduce the max HP of all characters by ${this.getStacksDisplayText()}.`;
    }

    onActStart(): void {
        const characters = this.gameState.currentRunCharacters;
        for (const character of characters) {
            character.maxHitpoints -= this.stacks;
            character.hitpoints = Math.min(character.hitpoints, character.maxHitpoints);
        }
    }
}

