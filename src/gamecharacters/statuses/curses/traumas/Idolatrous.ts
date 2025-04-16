/**
 * Sacrifice.  Draw 2 cards.  Cost 1 energy.
 */
import { TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { AbstractBuff } from "../../../buffs/AbstractBuff";

// Buff that implements the Sacrifice effect
class SacrificeBuff extends AbstractBuff {
    constructor() {
        super(1);
        this.isDebuff = true;
    }

    getDisplayName(): string {
        return "Sacrifice";
    }

    getDescription(): string {
        return "When this card is played, lose 3 HP.";
    }

    onThisCardInvoked(): void {
        const owner = this.getCardOwner();
        const card = this.getOwnerAsPlayableCard();
        
        if (owner && card) {
            this.pulseBuff();
            this.actionManager.dealDamage({
                baseDamageAmount: 3,
                target: owner,
                sourceCharacter: owner,
                fromAttack: false,
                sourceCard: card
            });
        }
    }
}

export class Idolatrous extends PlayableCard {
    constructor() {
        super({
            name: "Idolatrous",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new SacrificeBuff());
        this.portraitName = "idolatrous-curse";
    }

    override get description(): string {
        return "Sacrifice. Draw 2 cards.";
    }

    override InvokeCardEffects(): void {
        // Draw 2 cards
        this.actionManager.drawCards(2);
    }
}