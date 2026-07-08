// Cost 2.  Skill.  Gain 8 Block; +4 if a manufactured card is in your hand.
//
// Fallback condition (see cog_class_design.md / dispatch brief): there is no
// existing "played a manufactured card this turn" tracker reachable by a
// one-shot Skill — every existing played-this-turn tracker
// (RevolverExpertBuff, MidnightOilBuff, FearGod, Lexiophage) is local state
// on a Power/enemy buff that resets via onTurnStart and accumulates via
// onAnyCardPlayedByAnyone; a Skill has no buff instance to hang that state
// on. Adding a new combatState-wide "cards played this turn" list would
// touch ActionManager/GameState, which are outside this card's file
// ownership. Using the pre-authorized fallback instead: check the hand for
// a manufactured card at cast time.

import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class WarrantyClause extends PlayableCard {
    constructor() {
        super({
            name: "Warranty Clause",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.UNCOMMON,
            portraitName: "warranty-clause-card-art",
        });
        this.baseEnergyCost = 2;
        this.baseBlock = 8;
        this.baseMagicNumber = 4; // Bonus block if a manufactured card is in hand
        this.flavorText = "Covers parts, labor, and acts of God. Acts of the Company are excluded.";
    }

    private handHasManufacturedCard(): boolean {
        return GameState.getInstance().combatState.currentHand.some(card => card.wasManufactured());
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const bonus = this.handHasManufacturedCard() ? this.getBaseMagicNumberAfterResourceScaling() : 0;
        this.applyBlockToTarget(targetCard?.asBaseCharacter(), this.getBaseBlockAfterResourceScaling() + bonus);
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block; +${this.getDisplayedMagicNumber()} if a manufactured card is in your hand.`;
    }
}
