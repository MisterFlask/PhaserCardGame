// Cost 1.  Skill.  Draw 1.  Manufacture 1 Rivet into your hand.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { Rivet } from "../tokens/Rivet";

export class AssemblyLine extends PlayableCard {
    constructor() {
        super({
            name: "Assembly Line",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.flavorText = "Every station does one thing. The last station hands you a Rivet.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        this.actionManager.drawCards(1);
        BasicProcs.getInstance().ManufactureCardToHand(new Rivet().withOwner(this.owningCharacter));
    }

    override get description(): string {
        return `Draw 1 card. Manufacture a Rivet into your hand.`;
    }
}
