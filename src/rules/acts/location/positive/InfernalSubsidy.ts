import { AbstractBuff } from '../../../../gamecharacters/buffs/AbstractBuff';

export class InfernalSubsidyModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Infernal Subsidy";
    }

    getDescription(): string {
        return `At the start of each Act, gain 30 Sovereign Infernal Notes.`;
    }

    override onActStart(): void {
        this.gameState.sovereignInfernalNotes += 30;
    }
}
