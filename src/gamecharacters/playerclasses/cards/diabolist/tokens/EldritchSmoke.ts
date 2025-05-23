import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class EldritchSmoke extends PlayableCard {
    constructor() {
        super({
            name: "Eldritch Smoke",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseBlock = 4; // Set the base block value
        this.baseDamage = 0; // No damage
        this.baseMagicNumber = 0; // No magic number
        this.baseEnergyCost = 0;
        this.resourceScalings.push({
            resource: this.smog,
            blockScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Gain block
        this.actionManager.applyBlock({
            baseBlockValue: this.getBaseBlockAfterResourceScaling(),
            blockTargetCharacter: targetCard as BaseCharacter,
        });

        // Exhaust the card
        this.actionManager.exhaustCard(this);
    }

    override get description(): string {
        return `Gain ${this.getDisplayedBlock()} block and exhaust.`;
    }
}
