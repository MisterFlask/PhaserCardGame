import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";

export class DuctTapedCard extends PlayableCard {
    private firstCard: PlayableCard;
    private secondCard: PlayableCard;

    constructor(firstCard: PlayableCard, secondCard: PlayableCard) {
        super({
            name: `${firstCard.name} + ${secondCard.name}`,
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.SPECIAL,
        });

        this.firstCard = firstCard.Copy();
        this.secondCard = secondCard.Copy();

        // Copy properties from first card
        this.owningCharacter = firstCard.owningCharacter;
        this.baseEnergyCost = firstCard.energyCost + secondCard.energyCost;
        
        // Deep copy the buffs to avoid sharing references
        this.buffs = [...firstCard.buffs.map(buff => buff.clone()), ...secondCard.buffs.map(buff => buff.clone())];
        // Combine resource scalings
        this.resourceScalings = [...firstCard.resourceScalings, ...secondCard.resourceScalings];
    }

    override get description(): string {
        return `${this.firstCard.description}\n${this.secondCard.description}`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Invoke both cards' effects in sequence
        this.firstCard.InvokeCardEffects(targetCard);
        this.secondCard.InvokeCardEffects(targetCard);
    }

    override IsPerformableOn(targetCard?: AbstractCard): boolean {
        const firstRequiresTarget = this.firstCard.targetingType !== TargetingType.NO_TARGETING;
        const secondRequiresTarget = this.secondCard.targetingType !== TargetingType.NO_TARGETING;

        // If neither requires target, always performable
        if (!firstRequiresTarget && !secondRequiresTarget) {
            return true;
        }

        // If only first card requires target, use its check
        if (firstRequiresTarget && !secondRequiresTarget) {
            return this.firstCard.IsPerformableOn(targetCard);
        }

        // If only second card requires target, use its check  
        if (!firstRequiresTarget && secondRequiresTarget) {
            return this.secondCard.IsPerformableOn(targetCard);
        }

        // If both require target, either one being valid is sufficient
        return this.firstCard.IsPerformableOn(targetCard) || 
               this.secondCard.IsPerformableOn(targetCard);
    }
 

    override Copy(): this {
        return new DuctTapedCard(this.firstCard, this.secondCard) as this;
    }
}
