import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Lethality } from "../../../../buffs/standard/Strong";

export class InspiringPresence extends PlayableCard {
    constructor() {
        super({
            name: "Inspiring Presence",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2; // Amount of Pluck gained
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Gain Pluck
        this.actionManager.modifyPluck (this.getBaseMagicNumberAfterResourceScaling());

        // Apply Strong to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Lethality(1));
        });
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Pluck. All allies gain 1 Strength.`;
    }
}
