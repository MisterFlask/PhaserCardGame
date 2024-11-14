import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../PlayableCard";

export class Shoot extends PlayableCard {
    constructor() {
        super({
            name: "Fire Webley Revolver",
            description: `_`,
            portraitName: "gun",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 6;
        this.energyCost = 1;
        this.rarity = CardRarity.BASIC;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
    }
}
