// Cost 1.  Power.  Whenever you play a manufactured card, gain 1 Lethality
// this combat. (Name is the joke: the Cog appreciates.)

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { Lethality } from "../../../../buffs/standard/Lethality";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

class DepreciationScheduleBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Depreciation Schedule";
    }

    override getDescription(): string {
        return "Whenever you play a manufactured card, gain 1 Lethality this combat.";
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;
        if (playedCard.owningCharacter !== owner) return;
        if (!playedCard.wasManufactured()) return;

        this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(1));
    }
}

export class DepreciationSchedule extends PlayableCard {
    constructor() {
        super({
            name: "Depreciation Schedule",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
            portraitName: "depreciation-schedule-card-art",
        });
        this.baseEnergyCost = 1;
        this.flavorText = "On the books, the asset loses value every quarter. In the field, it just gets meaner.";
    }

    override get description(): string {
        return "Whenever you play a manufactured card, gain 1 Lethality this combat.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new DepreciationScheduleBuff()
        );
    }
}
