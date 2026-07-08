// Cost 1.  Skill.  Manufacture a 0-cost exhausting copy of the top card of your
// discard pile into your hand.

import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class PatentInfringement extends PlayableCard {
    constructor() {
        super({
            name: "Patent Infringement",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
            portraitName: "patent-infringement-card-art",
        });
        this.baseEnergyCost = 1;
        this.flavorText = "The original inventor is owed royalties. The original inventor is not owed a reply.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        const discardPile = GameState.getInstance().combatState.currentDiscardPile;
        if (discardPile.length === 0) return;

        const topCard = discardPile[discardPile.length - 1];
        const copy = (topCard.Copy() as PlayableCard).withOwner(this.owningCharacter);
        copy.baseEnergyCost = 0;
        copy.buffs.push(new ExhaustBuff());
        copy.tags.push("manufactured");

        BasicProcs.getInstance().ManufactureCardToHand(copy);
    }

    override get description(): string {
        return `Manufacture a 0-cost, exhausting copy of the top card of your discard pile into your hand.`;
    }
}
