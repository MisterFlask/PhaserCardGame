import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { Burning } from "../../../../buffs/standard/Burning";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
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
        this.baseMagicNumber = 2; // Amount of Vulnerable applied to enemies
        this.resourceScalings.push({
            resource: this.pluck,
            magicNumberScaling: 1
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {

        // Apply 2 Vulnerable to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Vulnerable(this.getBaseMagicNumberAfterResourceScaling()));
        });
        // Apply 2 Burning to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Burning(this.getBaseMagicNumberAfterResourceScaling()));
        });

        // Apply 1 Vulnerable to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Vulnerable(1));
        });

    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} Vulnerable and Burning to ALL enemies. Apply 1 Vulnerable to all allies.`;
    }
}
