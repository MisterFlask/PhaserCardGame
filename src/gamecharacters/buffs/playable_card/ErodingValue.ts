import { AbstractBuff } from "../AbstractBuff";
import { HellSellValue } from "../standard/HellSellValue";
import { SurfaceSellValue } from "../standard/SurfaceSellValue";

export class ErodingValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
    }

    getDisplayName(): string {
        return "Eroding Value";
    }

    getDescription(): string {
        return `When played, decrease HellSellValue and SurfaceSellValue by ${this.getStacksDisplayText()}.`;
    }

    override onThisCardInvoked(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.applyBuffToCard(ownerCard, new HellSellValue(-this.stacks));
            this.actionManager.applyBuffToCard(ownerCard, new SurfaceSellValue(-this.stacks));
        }
    }
}
