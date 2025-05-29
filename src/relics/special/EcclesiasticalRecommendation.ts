import { AbstractRelic } from "../AbstractRelic";
import { EntityRarity } from "../../gamecharacters/EntityRarity";

export class EcclesiasticalRecommendation extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.SPECIAL;
        this.isLedgerItem = true;
    }

    override getDisplayName(): string {
        return "Ecclesiastical Recommendation";
    }

    override getDescription(): string {
        return "Official paperwork certifying your moral character. Useful when dealing with colonial authorities.";
    }
}
