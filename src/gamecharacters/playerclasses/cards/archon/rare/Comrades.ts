// power.  any time you play Take Cover, gain 3 Temporary Lethality.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { TemporaryLethality } from "../../../../buffs/standard/TemporaryLethality";
import { TakeCover } from "../tokens/TakeCover";

class ComradesBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Comrades";
    }

    override getDescription(): string {
        return "Whenever you play Take Cover, gain 3 Temporary Lethality.";
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (playedCard.name === "Take Cover" && playedCard.owningCharacter === this.getOwnerAsCharacter()) {
            this.actionManager.applyBuffToCharacterOrCard(this.getOwnerAsCharacter()!, new TemporaryLethality(3));
        }
    }
}

export class Comrades extends PlayableCard {
    constructor() {
        super({
            name: "Comrades",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter!, new ComradesBuff());
        this.actionManager.createCardToDrawPile(new TakeCover());
        this.actionManager.createCardToDrawPile(new TakeCover());
    }

    override get description(): string {
        return "Whenever you play Take Cover, gain 3 Temporary Lethality.  Add 2 Take Cover to your draw pile.";
    }
}

