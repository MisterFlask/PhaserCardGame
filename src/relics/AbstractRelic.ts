import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import ImageUtils from "../utils/ImageUtils";

export abstract class AbstractRelic extends AbstractBuff {

    isLedgerItem: boolean = false;

    rarity: EntityRarity = EntityRarity.COMMON;
    price: number = this.rarity.basePrice * 2;
    surfaceSellValue: number = 0;

    constructor() {
        super();
    }

    public init(): void {
        if (!this.imageName) {
            this.imageName = ImageUtils.getDeterministicAbstractPlaceholder(this.getDisplayName());
            this.tint = this.generateSeededRandomBuffColor();
        }
    }

}
