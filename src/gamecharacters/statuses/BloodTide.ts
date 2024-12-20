import { TargetingType } from "../AbstractCard";
import { EntityRarity, PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";

export class BloodTide extends PlayableCard {
    constructor() {
        super({
            name: "Blood Tide",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return "Gain 1 Blood.";
    }

    override InvokeCardEffects(): void {
        this.actionManager.modifyBlood(1);
    }
}
