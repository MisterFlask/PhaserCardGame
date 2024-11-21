import { AbstractBuff } from "../../AbstractBuff";

export class OnSale extends AbstractBuff {
    private realName: string;
    constructor(stacks: number = 1) {
        super();
        this.imageName = "sale-tag";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
        this.realName = OnSale.ON_SALE_SLOGANS[Math.floor(Math.random() * OnSale.ON_SALE_SLOGANS.length)];
    }

    private static readonly ON_SALE_SLOGANS = [
        "ON SALE!",
        "LIMITED TIME OFFER!",
        "SALE!",
        "CLEARANCE!",
        "ALL SUPPLIES MUST GO!"
    ]

    override getName(): string {
        return this.realName;
    }

    override getDescription(): string {
        return `${this.stacks}% off!`;
    }

    override purchasePricePercentModifier(): number {
        return -1 * this.stacks;
    }

    override onGainingThisCard(): void {
        this.stacks = 0; // should not persist after the card is bought
    }
}
