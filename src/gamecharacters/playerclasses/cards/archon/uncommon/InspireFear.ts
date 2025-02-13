import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class InspireFear extends PlayableCard {
    constructor() {
        super({
            name: "Inspire Fear",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.baseMagicNumber = 3; // Amount of Weak applied to enemies
        this.resourceScalings.push({
            resource: this.pluck,
            magicNumberScaling: 1
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {

        // Apply 2 Vulnerable to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
        });

    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} Vulnerable to ALL enemies.  Gain 15 Intimidation.`;
    }
}
