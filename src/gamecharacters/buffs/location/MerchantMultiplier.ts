import { ActionManagerFetcher } from "../../../utils/ActionManagerFetcher";
import { AbstractBuff } from "../AbstractBuff";

export class MerchantMultiplier extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "merchant-multiplier";
        this.stackable = true;
        this.isDebuff = false;
        this.id = "MerchantMultiplier";
        
        // Calculate the multiplier based on act and floor number
        const actNumber = ActionManagerFetcher.getGameState().currentAct;
        const currentLocation = ActionManagerFetcher.getGameState().getCurrentLocation();
        const floorNumber = currentLocation?.floor ?? 1;
        this.stacks = (actNumber * 10) + floorNumber;
    }

    override getDisplayName(): string {
        return "Merchant's Rate";
    }

    override getDescription(): string {
        return `The merchant at this location offers ${this.getStacksDisplayText()}% more for your cargo than the base value.`;
    }

    override purchasePricePercentModifier(): number {
        return this.stacks;
    }
} 