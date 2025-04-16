/**
 * While this is in your hand, any time you target a different ally with a card, deal 5 damage to that ally.  Cost 1 energy.
 */
import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { AbstractBuff } from "../../../buffs/AbstractBuff";

// Buff that implements the Vain curse effect
class VainBuff extends AbstractBuff {
    constructor() {
        super(1);
        this.isDebuff = true;
    }

    getDisplayName(): string {
        return "Vain";
    }

    getDescription(): string {
        return "While this card is in your hand, any time you target a different ally with a card, deal 5 damage to that ally.";
    }

    onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        // Check if this buff's card is in hand
        const vainCard = this.getOwnerAsPlayableCard();
        if (!vainCard) return;
        
        const inHand = this.gameState.combatState.currentHand.some(card => card.id === vainCard.id);
        if (!inHand) return;

        // Check if the played card is targeting an ally that isn't self
        if (target && 
            target.team === vainCard.team && 
            playedCard.owningCharacter && 
            target.id !== playedCard.owningCharacter.id) {
            
            // Deal 5 damage to the targeted ally
            this.pulseBuff();
            this.actionManager.dealDamage({
                baseDamageAmount: 5,
                target: target,
                sourceCharacter: playedCard.owningCharacter,
                fromAttack: false,
                sourceCard: vainCard
            });
        }
    }
}

export class Vain extends PlayableCard {
    constructor() {
        super({
            name: "Vain",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new VainBuff());
        this.portraitName = "vain-curse";
    }

    override get description(): string {
        return "While this is in your hand, any time you target a different ally with a card, deal 5 damage to that ally.";
    }

    override InvokeCardEffects(): void {
        // No effect when played
    }
}