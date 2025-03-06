import { AbstractBuff } from '../../../../gamecharacters/buffs/AbstractBuff';

export class ImperialSubsidyModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Imperial Subsidy";
    }

    getDescription(): string {
        return `At the start of each Act, gain 30 Promissory Notes.`;
    }

    override onActStart(): void {
        this.gameState.britishPoundsSterling += 30;
    }
}
