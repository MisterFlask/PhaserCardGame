import { AbstractBuff } from '../../../../gamecharacters/buffs/AbstractBuff';

export class NumerousRestSitesModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Numerous Rest Sites";
    }

    getDescription(): string {
        return `2 additional rest sites will be in this region [impl tbd].`;
    }
}
