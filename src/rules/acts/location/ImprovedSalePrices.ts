import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';

export class ImprovedSalePrices extends AbstractBuff {
    constructor() {
        super();
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "High Demand Location";
    }

    getDescription(): string {
        return `Cards sell for ${this.stacks * 10}% more.`;
    }

    modifySellPrice(basePrice: number): number {
        return Math.floor(basePrice * (1 + (this.stacks * 0.1)));
    }
}
