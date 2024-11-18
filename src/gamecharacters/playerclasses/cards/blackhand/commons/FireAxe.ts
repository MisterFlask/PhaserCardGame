import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";

export class FireAxe extends PlayableCard {
    constructor() {
        super({
            name: "Fire Axe",
            description: `_`,
            portraitName: "fire-axe",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 8;
        this.baseMagicNumber = 2;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Apply ${this.getDisplayedMagicNumber()} Burning.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
        }
    }
}
