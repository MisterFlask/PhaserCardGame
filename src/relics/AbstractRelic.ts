import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import ImageUtils from "../utils/ImageUtils";

export abstract class AbstractRelic extends AbstractBuff {

    isLedgerItem: boolean = false;

    rarity: EntityRarity = EntityRarity.COMMON;
    price: number = this.rarity.basePrice * 2;
    surfaceSellValue: number = 0;

    /**
     * True when init() fell back to a deterministic abstract placeholder.
     * Only placeholder icons receive the seeded tint (which exists to make
     * identical abstract glyphs distinguishable); relics with real artwork
     * (imageName set in their constructor) render untinted, so full-color
     * relic art is possible.
     */
    usesPlaceholderIcon: boolean = false;

    constructor() {
        super();
    }

    public init(): void {
        if (!this.imageName) {
            this.imageName = ImageUtils.getDeterministicAbstractPlaceholder(this.getDisplayName());
            this.tint = this.generateSeededRandomBuffColor();
            this.usesPlaceholderIcon = true;
        }
    }

}
