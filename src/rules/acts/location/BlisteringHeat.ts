import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';

export class BlisteringHeatModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Blistering Heat";
    }

    getDescription(): string {
        return `At the start of each act, all characters lose ${this.getStacksDisplayText()} HP.`;
    }

    onActStart(): void {
        const characters = this.gameState.currentRunCharacters;
        for (const character of characters) {
            this.actionManager.dealDamage({baseDamageAmount: this.stacks, target: character, fromAttack: false});
        }
    }

    constructor(stacks: number) {
        super();
        this.stacks = stacks;
    }
}

