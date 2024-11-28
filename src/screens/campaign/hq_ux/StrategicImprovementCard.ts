import { AbstractCard } from '../../../gamecharacters/AbstractCard';
import { CardType } from '../../../gamecharacters/Primitives';

export enum FactoryEffectType {
    YEARLY = "YEARLY",
    PER_RUN = "PER_RUN",
    PERSISTENT = "PERSISTENT"
}

export class StrategicImprovementCard extends AbstractCard {
    public purchaseCost: number;

    constructor({ 
        name, 
        description, 
        purchaseCost,
        portraitName 
    }: { 
        name: string; 
        description: string; 
        purchaseCost: number;
        portraitName?: string;
    }) {
        super({ 
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            tooltip: `A factory that costs £${purchaseCost}`
        });
        this.purchaseCost = purchaseCost;
    }
} 