import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Strong } from "../../../../buffs/standard/Strong";

export class InspiringPresence extends PlayableCard {
    constructor() {
        super({
            name: "Inspiring Presence",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.baseMagicNumber = 2; // Amount of Pluck gained
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Gain Pluck
        this.actionManager.modifyPluck (this.getBaseMagicNumberAfterResourceScaling());

        // Apply Strong to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacter(ally, new Strong(1));
        });
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Pluck. All allies gain 1 Strength.`;
    }
}
