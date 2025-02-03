import { AbstractBuff } from '../../../../gamecharacters/buffs/AbstractBuff';

export class InfernalSubsidyModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Infernal Subsidy";
    }

    getDescription(): string {
        return `At the start of each Act, gain 30 Denarians.`;
    }

    override onActStart(): void {
        this.gameState.denarians += 30;
    }
}
